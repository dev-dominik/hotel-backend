import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class ListRoomsQuery {
  @ApiPropertyOptional({
    description: 'Minimum guest capacity to filter by',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  capacity?: number;
}

export class PublicRoomResponse {
  @ApiProperty({ example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' })
  id!: string;

  @ApiProperty({ example: 'Deluxe Suite' })
  name!: string;

  @ApiProperty({ example: 'Spacious suite with sea view.' })
  description!: string;

  @ApiProperty({ example: 299.99 })
  pricePerNight!: number;

  @ApiProperty({ example: 4 })
  capacity!: number;

  @ApiProperty({ example: true })
  isAvailable!: boolean;

  @ApiProperty({ example: 'https://example.com/main.jpg' })
  mainImageUrl!: string;

  @ApiProperty({ example: ['https://example.com/img1.jpg'] })
  imageUrls!: string[];
}
