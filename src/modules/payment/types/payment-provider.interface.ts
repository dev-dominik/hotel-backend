import { PaymentProvider } from '../entity/payment.provider';
import {
  CreatePayment,
  CreatePaymentResult,
  ParsedWebhookEvent,
  RawWebhookRequest,
} from './payment.types';

export interface IPaymentProvider {
  readonly type: PaymentProvider;

  createPayment(data: CreatePayment): Promise<CreatePaymentResult>;

  parseWebhook(request: RawWebhookRequest): Promise<ParsedWebhookEvent | null>;
}
