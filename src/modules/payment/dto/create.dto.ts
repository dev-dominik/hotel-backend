import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaymentProvider } from '../entity/payment.provider';

export class CreatePaymentRequest {
  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    description: 'ID of the reservation being paid for',
  })
  @IsUUID()
  reservationId!: string;

  @ApiPropertyOptional({
    enum: PaymentProvider,
    example: PaymentProvider.STRIPE,
    description: 'Defaults to STRIPE',
  })
  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;
}

export class CreatePaymentResponse {
  @ApiProperty({ example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' })
  paymentId!: string;

  @ApiProperty({ example: 'https://checkout.stripe.com/c/pay/cs_test_...' })
  redirectUrl!: string;
}
