import { ApiProperty } from '@nestjs/swagger';
import { PaymentProvider } from '../entity/payment.provider';
import { PaymentStatus } from '../entity/payment.status';

export class PaymentResponse {
  @ApiProperty({ example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' })
  id!: string;

  @ApiProperty({ example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' })
  reservationId!: string;

  @ApiProperty({ enum: PaymentProvider, example: PaymentProvider.STRIPE })
  provider!: PaymentProvider;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @ApiProperty({
    example: 40000,
    description: "Amount in the currency's smallest unit",
  })
  amount!: number;

  @ApiProperty({ example: 'PLN' })
  currency!: string;

  @ApiProperty({ example: '2026-08-10T12:00:00.000Z', nullable: true })
  paidAt!: string | null;
}
