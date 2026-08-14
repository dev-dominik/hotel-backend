import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import appConfigType from '@/core/config/type';
import type { AppConfig } from '@/core/config/type';
import { Payment } from './entity/payment.entity';
import { Reservation } from '../reservations/entity/reservation.entity';
import { ReservationStatus } from '../reservations/entity/reservation-status.enum';
import { PaymentProvider } from './entity/payment.provider';
import { PaymentStatus } from './entity/payment.status';
import { UsersService } from '../users/users.service';
import { PaymentProviderResolver } from './payments.resolver';
import type { RawWebhookRequest } from './types/payment.types';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly usersService: UsersService,
    private readonly resolver: PaymentProviderResolver,
    @Inject(appConfigType.KEY)
    private readonly config: AppConfig,
  ) {}

  async create(data: {
    userId: string;
    reservationId: string;
    provider?: PaymentProvider;
  }): Promise<{ paymentId: string; redirectUrl: string }> {
    const providerType = data.provider ?? PaymentProvider.STRIPE;
    const provider = this.resolver.get(providerType);

    const user = await this.usersService.throwIfNotExistsOrEmailNotVerified(
      data.userId,
    );

    const reservation = await this.reservationRepository.findOne({
      where: { id: data.reservationId },
    });
    if (!reservation) throw new NotFoundException('Reservation not found!');
    if (reservation.userId !== data.userId)
      throw new ForbiddenException(
        'You do not have access to this reservation',
      );
    if (reservation.amountPaid <= 0)
      throw new BadRequestException('Payment amount must be greater than 0');

    const alreadyPaid = await this.paymentRepository.findOne({
      where: { reservationId: reservation.id, status: PaymentStatus.PAID },
    });
    if (alreadyPaid)
      throw new BadRequestException(
        'This reservation has already been paid for!',
      );

    const currency = this.config.payments.currency;
    const amountMinorUnits = Math.round(reservation.amountPaid * 100);
    const payment = await this.paymentRepository.save(
      this.paymentRepository.create({
        reservationId: reservation.id,
        provider: providerType,
        status: PaymentStatus.CREATED,
        amount: String(amountMinorUnits),
        currency,
      }),
    );

    try {
      await this.updatePayment({
        id: payment.id,
        status: PaymentStatus.CREATED,
        update: { status: PaymentStatus.REGISTERING },
      });

      const result = await provider.createPayment({
        paymentId: payment.id,
        userId: user.id,
        reservationId: reservation.id,
        orderId: reservation.id,
        amount: amountMinorUnits,
        currency,
        customerEmail: user.email,
      });

      if (!result.redirectUrl)
        throw new Error(
          `${providerType} provider did not return a redirect URL`,
        );

      await this.updatePayment({
        id: payment.id,
        update: {
          providerSessionId: payment.id,
          providerToken: result.externalId ?? null,
          status: PaymentStatus.PENDING,
        },
      });

      return { paymentId: payment.id, redirectUrl: result.redirectUrl };
    } catch (error) {
      await this.updatePayment({
        id: payment.id,
        update: { status: PaymentStatus.FAILED, failedAt: new Date() },
      });

      this.logger.error({
        message: 'Create payment error',
        paymentId: payment.id,
        error: error instanceof Error ? error.message : 'unknown error',
      });
      throw error;
    }
  }

  async getPayment(id: string, userId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    const reservation = await this.reservationRepository.findOne({
      where: { id: payment.reservationId },
    });
    if (!reservation || reservation.userId !== userId)
      throw new ForbiddenException('You do not have access to this payment');

    return payment;
  }

  async handleWebhook(
    providerType: PaymentProvider,
    request: RawWebhookRequest,
  ): Promise<void> {
    const provider = this.resolver.get(providerType);

    const event = await provider.parseWebhook(request);
    if (!event) {
      this.logger.warn({
        message: 'Webhook ignored: no verified event',
        provider: providerType,
      });
      return;
    }

    const payment = await this.paymentRepository.findOne({
      where: { provider: providerType, providerSessionId: event.sessionId },
    });
    if (!payment) {
      this.logger.error({
        message: 'Webhook received for an unknown payment session',
        provider: providerType,
        sessionId: event.sessionId,
      });
      return;
    }

    if (payment.status === PaymentStatus.PAID) return;

    if (
      payment.currency !== event.currency ||
      Number(payment.amount) !== event.amount
    ) {
      this.logger.error({
        message: 'Webhook amount/currency does not match stored payment',
        paymentId: payment.id,
        expected: { amount: payment.amount, currency: payment.currency },
        received: { amount: event.amount, currency: event.currency },
      });
      await this.updatePayment({
        id: payment.id,
        update: { status: PaymentStatus.FAILED, failedAt: new Date() },
      });
      return;
    }

    await this.updatePayment({
      id: payment.id,
      update: {
        status: PaymentStatus.PAID,
        paidAt: new Date(),
        providerPaymentId: event.externalId,
      },
    });

    await this.confirmReservation(payment.reservationId);
  }

  private async confirmReservation(reservationId: string): Promise<void> {
    const result = await this.reservationRepository.update(
      { id: reservationId, status: ReservationStatus.PENDING },
      { status: ReservationStatus.CONFIRMED },
    );

    if (result.affected !== 1) {
      this.logger.error({
        message:
          'Payment succeeded but reservation was no longer PENDING — likely expired before payment landed. Needs manual review (possible refund).',
        reservationId,
      });
    }
  }

  private async updatePayment({
    id,
    status,
    update,
  }: {
    id: string;
    status?: PaymentStatus;
    update: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>>;
  }): Promise<void> {
    const result = await this.paymentRepository.update(
      {
        id,
        ...(status !== undefined ? { status } : {}),
      },
      update,
    );

    if (result.affected !== 1) {
      throw new Error(
        status !== undefined
          ? `Payment ${id} was not found or its status is no longer ${status}.`
          : `Payment ${id} was not found.`,
      );
    }
  }
}
