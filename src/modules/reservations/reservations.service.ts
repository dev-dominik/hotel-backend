import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Room } from '@/modules/admin/room/entity/room.entity';
import { Reservation } from './entity/reservation.entity';
import { ReservationStatus } from './entity/reservation-status.enum';
import { PaymentType } from './entity/payment-type.enum';
import { CreateReservationRequest } from './dto/create.dto';
import { User } from '@/modules/users/entity/user.entity';

const DEPOSIT_RATE = 0.3;
const PAYMENT_WINDOW_MS = 15 * 60 * 1000;

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createReservation(
    userId: string,
    dto: CreateReservationRequest,
  ): Promise<Reservation> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found!');
    if (user.isBlocked)
      throw new BadRequestException('You cannot create reservation');

    const checkIn = this.toUtcMidnight(dto.checkInDate);
    const checkOut = this.toUtcMidnight(dto.checkOutDate);
    const today = this.toUtcMidnight(new Date());

    if (checkIn < today)
      throw new BadRequestException('Check-in date cannot be in the past');
    if (checkOut <= checkIn)
      throw new BadRequestException(
        'Check-out date must be after check-in date',
      );

    const guests = dto.adults + dto.children;

    return this.dataSource.transaction(async (manager) => {
      const room = await manager.findOne(Room, {
        where: { id: dto.roomId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!room) throw new NotFoundException('Room not found');
      if (!room.isAvailable)
        throw new BadRequestException('Room is not available for booking');
      if (guests > room.capacity)
        throw new BadRequestException(
          `Room capacity is ${room.capacity} guests`,
        );

      const overlappingCount = await manager
        .createQueryBuilder(Reservation, 'reservation')
        .where('reservation.roomId = :roomId', { roomId: room.id })
        .andWhere('reservation.status IN (:...statuses)', {
          statuses: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        })
        .andWhere('reservation.checkInDate < :checkOut', { checkOut })
        .andWhere('reservation.checkOutDate > :checkIn', { checkIn })
        .getCount();

      if (overlappingCount >= room.amount)
        throw new ConflictException(
          'Room is fully booked for the selected dates',
        );

      const nightsAmount = this.diffInNights(checkIn, checkOut);
      const totalPrice = Number(
        (nightsAmount * Number(room.pricePerNight)).toFixed(2),
      );

      const paymentType = dto.paymentType ?? PaymentType.FULL;
      const amountPaid =
        paymentType === PaymentType.DEPOSIT
          ? Number((totalPrice * DEPOSIT_RATE).toFixed(2))
          : totalPrice;

      const reservation = manager.create(Reservation, {
        userId,
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: dto.adults,
        children: dto.children,
        nightsAmount,
        totalPrice,
        paymentType,
        amountPaid,
        status: ReservationStatus.PENDING,
        paymentDueAt: new Date(Date.now() + PAYMENT_WINDOW_MS),
        updatedAt: new Date(),
      });

      return manager.save(reservation);
    });
  }

  async listReservations(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    items: Reservation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [items, total] = await this.reservationRepository.findAndCount({
      where: { userId },
      relations: { room: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getReservation(userId: string, id: string): Promise<Reservation> {
    return this.findOwnedReservation(userId, id);
  }

  async cancelReservation(userId: string, id: string): Promise<void> {
    const reservation = await this.findOwnedReservation(userId, id);

    if (reservation.status === ReservationStatus.CANCELLED) return;
    if (reservation.status === ReservationStatus.COMPLETED)
      throw new BadRequestException('Cannot cancel a completed reservation');
    if (
      this.toUtcMidnight(reservation.checkInDate) <
      this.toUtcMidnight(new Date())
    )
      throw new BadRequestException('Cannot cancel a past reservation');

    reservation.status = ReservationStatus.CANCELLED;
    await this.reservationRepository.save(reservation);
  }

  async expirePendingReservations(): Promise<number> {
    const result = await this.reservationRepository
      .createQueryBuilder()
      .update(Reservation)
      .set({ status: ReservationStatus.CANCELLED })
      .where('status = :status', { status: ReservationStatus.PENDING })
      .andWhere('"paymentDueAt" < :now', { now: new Date() })
      .execute();

    return result.affected ?? 0;
  }

  private async findOwnedReservation(
    userId: string,
    id: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: { room: true },
    });
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.userId !== userId)
      throw new ForbiddenException(
        'You do not have access to this reservation',
      );

    return reservation;
  }

  private diffInNights(checkIn: Date, checkOut: Date): number {
    const msPerNight = 24 * 60 * 60 * 1000;
    return Math.round((checkOut.getTime() - checkIn.getTime()) / msPerNight);
  }

  // Global ValidationPipe runs without `transform: true`, so `checkInDate`/
  // `checkOutDate` arrive as raw "YYYY-MM-DD" strings despite the Date type
  // on the entity. Normalize both request strings and hydrated Date values
  // to UTC midnight so date-only comparisons aren't skewed by server timezone.
  private toUtcMidnight(value: Date | string): Date {
    const iso = typeof value === 'string' ? value : value.toISOString();
    return new Date(iso.slice(0, 10));
  }
}
