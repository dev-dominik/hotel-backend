import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '@/core/database/decimal.transformer';

@Entity('rooms')
@Index(['name'], { unique: true })
export class Room {
  @ApiProperty({
    example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    description: 'Unique room ID',
  })
  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'Deluxe Apartment',
    description: 'Room name',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @ApiProperty({
    example: 'Spacious apartment with balcony and sea view.',
    description: 'Room description',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @Column({ type: 'text' })
  description!: string;

  @ApiProperty({
    example: 299.99,
    description: 'Price per one night',
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
  pricePerNight!: number;

  @ApiProperty({
    example: 4,
    description: 'Maximum number of guests',
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Column({ type: 'int' })
  capacity!: number;

  @ApiProperty({
    example: true,
    description: 'Whether the room is generally available',
    default: true,
  })
  @IsBoolean()
  @Column({ type: 'boolean', default: true })
  isAvailable!: boolean;

  @ApiProperty({
    example: 10,
    description: 'Total number of rooms of this type',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Column({ type: 'int', default: 0 })
  amount!: number;

  @ApiProperty({
    example: 7,
    description: 'Currently available number of rooms of this type',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Column({ type: 'int', default: 0 })
  amountAvailable!: number;

  @ApiProperty({
    example: 'https://example.com/uploads/rooms/main-image.webp',
    description: 'Main room image URL',
  })
  @IsString()
  @IsUrl({ require_tld: false })
  @Column({ type: 'varchar', length: 500 })
  mainImageUrl!: string;

  @ApiProperty({
    example: [
      'https://example.com/uploads/rooms/image-1.webp',
      'https://example.com/uploads/rooms/image-2.webp',
    ],
    description: 'Additional room image URLs',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsUrl({ require_tld: false }, { each: true })
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  imageUrls!: string[];

  @ApiProperty({
    example: '2026-07-05T12:00:00.000Z',
    description: 'Creation date',
  })
  @IsDate()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-07-05T12:30:00.000Z',
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
