import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';

export class ListRoomsQuery {
  @ApiPropertyOptional({ description: 'Minimum guest capacity', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  capacity?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(50)
  limit?: number;
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

export class PaginatedRoomsResponse {
  @ApiProperty({ type: [PublicRoomResponse] })
  items!: PublicRoomResponse[];

  @ApiProperty({ example: 12 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 6 })
  limit!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;
}
