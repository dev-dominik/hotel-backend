export interface CreatePayment {
  /** Our own Payment row id. Passed to the provider so a later webhook can be matched back to it. */
  paymentId: string;
  userId: string;
  reservationId: string;
  orderId: string;
  /** Minor currency unit (e.g. grosze for PLN, cents for EUR), integer. */
  amount: number;
  currency: string;
  customerEmail: string;
}

export interface CreatePaymentResult {
  externalId?: string;
  redirectUrl?: string;
  clientSecret?: string;
}

export interface RawWebhookRequest {
  rawBody: Buffer;
  headers: Record<string, string | string[] | undefined>;
}

export interface ParsedWebhookEvent {
  sessionId: string;
  externalId: string;
  amount: number;
  currency: string;
  raw: unknown;
}
