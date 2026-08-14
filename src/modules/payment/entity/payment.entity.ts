import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from './payment.status';
import { PaymentProvider } from './payment.provider';

@Entity('payments')
@Index('idx_payment_order_id', ['reservationId'])
@Index('idx_payment_provider_external_id', ['provider', 'providerPaymentId'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  reservationId!: string;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
  })
  provider!: PaymentProvider;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.CREATED,
  })
  status!: PaymentStatus;

  @Column({ type: 'bigint' })
  amount!: string;

  @Column({
    type: 'varchar',
    length: 3,
  })
  currency!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  providerPaymentId!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  providerSessionId!: string | null;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  providerToken!: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  paidAt!: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  failedAt!: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  cancelledAt!: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  refundedAt!: Date | null;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt!: Date;
}
