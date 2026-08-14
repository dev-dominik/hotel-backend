import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentProvider } from './entity/payment.provider';
import { IPaymentProvider } from './types/payment-provider.interface';
import { StripeProvider } from './provider/stripe/stripe.provider';

@Injectable()
export class PaymentProviderResolver {
  private readonly providers: Map<PaymentProvider, IPaymentProvider>;

  constructor(stripeProvider: StripeProvider) {
    this.providers = new Map([[stripeProvider.type, stripeProvider]]);
  }

  get(type: PaymentProvider): IPaymentProvider {
    const provider = this.providers.get(type);

    if (!provider)
      throw new NotFoundException(`Unsupported payment provider: ${type}`);

    return provider;
  }
}
