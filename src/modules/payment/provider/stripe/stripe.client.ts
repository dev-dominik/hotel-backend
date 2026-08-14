import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import appConfigType from '@/core/config/type';
import type { AppConfig } from '@/core/config/type';

@Injectable()
export class StripeClient {
  readonly sdk: Stripe;

  constructor(
    @Inject(appConfigType.KEY)
    private readonly config: AppConfig,
  ) {
    this.sdk = new Stripe(this.config.payments.stripe.secretKey);
  }

  createCheckoutSession(data: {
    paymentId: string;
    amount: number;
    currency: string;
    customerEmail: string;
    description: string;
  }): Promise<Stripe.Checkout.Session> {
    return this.sdk.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: data.paymentId,
      customer_email: data.customerEmail,
      success_url: `${this.config.payments.stripe.successUrl}?paymentId=${data.paymentId}`,
      cancel_url: `${this.config.payments.stripe.cancelUrl}?paymentId=${data.paymentId}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: data.currency.toLowerCase(),
            unit_amount: data.amount,
            product_data: { name: data.description },
          },
        },
      ],
    });
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    return this.sdk.webhooks.constructEvent(
      rawBody,
      signature,
      this.config.payments.stripe.webhookSecret,
    );
  }
}
