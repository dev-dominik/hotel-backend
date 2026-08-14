import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from '@/modules/admin/room/entity/room.entity';
import { User } from '@/modules/users/entity/user.entity';
import { decimalTransformer } from '@/core/database/decimal.transformer';
import { ReservationStatus } from './reservation-status.enum';
import { PaymentType } from './payment-type.enum';

@Entity('reservations')
@Index(['roomId', 'checkInDate', 'checkOutDate'])
export class Reservation {
  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    description: 'Unique reservation ID',
  })
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    description: 'ID of the booked room',
  })
  @IsUUID()
  @Column({ type: 'uuid' })
  roomId!: string;

  @ManyToOne(() => Room, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'ID of the user who made the reservation',
  })
  @IsUUID()
  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ApiProperty({
    example: '2026-08-01',
    description: 'Check-in date (inclusive)',
  })
  @IsDateString()
  @Column({ type: 'date' })
  checkInDate!: Date;

  @ApiProperty({
    example: '2026-08-05',
    description: 'Check-out date (exclusive)',
  })
  @IsDateString()
  @Column({ type: 'date' })
  checkOutDate!: Date;

  @ApiProperty({
    example: 2,
    description: 'Number of adult guests',
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Column({ type: 'int' })
  adults!: number;

  @ApiProperty({
    example: 0,
    description: 'Number of child guests',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Column({ type: 'int', default: 0 })
  children!: number;

  @ApiProperty({
    example: 4,
    description: 'Number of nights between check-in and check-out',
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Column({ type: 'int' })
  nightsAmount!: number;

  @ApiProperty({
    example: 1199.96,
    description: 'Total price for the stay (nightsAmount * room.pricePerNight)',
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  totalPrice!: number;

  @ApiProperty({
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
    description: 'Current status of the reservation',
  })
  @IsEnum(ReservationStatus)
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status!: ReservationStatus;

  @ApiProperty({
    example: '2026-07-14T12:15:00.000Z',
    description:
      'Deadline to pay before an unpaid (PENDING) reservation is automatically cancelled. Server-computed, never trust client input.',
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @Column({ type: 'timestamp with time zone', nullable: true })
  paymentDueAt!: Date | null;

  @ApiProperty({
    enum: PaymentType,
    example: PaymentType.FULL,
    description: 'Whether the guest paid in full or a deposit at booking time',
  })
  @IsEnum(PaymentType)
  @IsOptional()
  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.FULL,
  })
  paymentType!: PaymentType;

  @ApiProperty({
    example: 359.99,
    description:
      'Amount actually paid at booking time (full totalPrice, or the deposit share of it). Server-computed, never trust client input.',
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  amountPaid!: number;

  @ApiProperty({
    example: '2026-07-14T12:00:00.000Z',
    description: 'Creation date',
  })
  @IsDate()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-07-14T12:30:00.000Z',
    description: 'Last update date',
  })
  @IsDate()
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
    description: 'Soft delete date',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsDate()
  @DeleteDateColumn({
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt!: Date | null;
}
