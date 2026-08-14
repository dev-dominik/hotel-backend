import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type Stripe from 'stripe';
import appConfigType from '@/core/config/type';
import type { AppConfig } from '@/core/config/type';
import { IPaymentProvider } from '../../types/payment-provider.interface';
import {
  CreatePayment,
  CreatePaymentResult,
  ParsedWebhookEvent,
  RawWebhookRequest,
} from '../../types/payment.types';
import { PaymentProvider } from '../../entity/payment.provider';
import { StripeClient } from './stripe.client';

@Injectable()
export class StripeProvider implements IPaymentProvider {
  readonly type = PaymentProvider.STRIPE;

  private readonly logger = new Logger(StripeProvider.name);

  constructor(
    private readonly client: StripeClient,
    @Inject(appConfigType.KEY)
    private readonly config: AppConfig,
  ) {}

  async createPayment(data: CreatePayment): Promise<CreatePaymentResult> {
    if (this.config.payments.stripe.disabled)
      throw new ServiceUnavailableException(
        'Stripe payments are currently disabled',
      );

    const session = await this.client.createCheckoutSession({
      paymentId: data.paymentId,
      amount: data.amount,
      currency: data.currency,
      customerEmail: data.customerEmail,
      description: `Order ${data.orderId}`,
    });

    if (!session.url) throw new Error('Stripe did not return a checkout URL');

    return { externalId: session.id, redirectUrl: session.url };
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async parseWebhook(
    request: RawWebhookRequest,
  ): Promise<ParsedWebhookEvent | null> {
    const signature = request.headers['stripe-signature'];
    if (!signature || Array.isArray(signature)) {
      this.logger.warn('Received Stripe webhook without a signature header');
      return null;
    }

    let event: Stripe.Event;
    try {
      event = this.client.constructWebhookEvent(request.rawBody, signature);
    } catch (error) {
      this.logger.warn({
        message: 'Stripe webhook signature verification failed',
        error: error instanceof Error ? error.message : 'unknown error',
      });
      return null;
    }

    if (event.type !== 'checkout.session.completed') return null;

    const session = event.data.object;
    if (
      !session.client_reference_id ||
      session.amount_total === null ||
      !session.currency ||
      !session.payment_intent
    ) {
      this.logger.warn({
        message: 'Stripe checkout.session.completed missing required fields',
        sessionId: session.id,
      });
      return null;
    }

    return {
      sessionId: session.client_reference_id,
      externalId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent.id,
      amount: session.amount_total,
      currency: session.currency.toUpperCase(),
      raw: event,
    };
  }
}
