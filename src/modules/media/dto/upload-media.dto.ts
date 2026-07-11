import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import type { Media } from '../entity/media.entity';

export class UploadMediaRequest {
  @ApiPropertyOptional({
    description: 'Cloudinary folder to upload into (e.g. "rooms", "users")',
    example: 'rooms',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9_/-]+$/i, {
    message:
      'Folder may only contain letters, numbers, underscores, hyphens and slashes',
  })
  folder?: string;
}

export class UploadMediaResponse implements Partial<Media> {
  @ApiProperty() id!: string;
  @ApiProperty() url!: string;
  @ApiProperty() publicId!: string;
  @ApiProperty({ nullable: true }) folder!: string | null;
  @ApiProperty({ nullable: true }) format!: string | null;
  @ApiProperty({ nullable: true }) bytes!: number | null;
  @ApiProperty({ nullable: true }) width!: number | null;
  @ApiProperty({ nullable: true }) height!: number | null;
  @ApiProperty() createdAt!: Date;
}
