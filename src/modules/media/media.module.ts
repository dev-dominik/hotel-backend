import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AppThrottlerModule } from '@/core/throttler/throttler.module';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';
import { Media } from './entity/media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { MediaStorageProvider } from './storage/media-storage.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Media]), AppThrottlerModule],
  controllers: [MediaController],
  providers: [
    MediaService,
    CloudinaryProvider,
    MediaStorageProvider,
    AdminGuard,
    AppThrottlerGuard,
  ],
  exports: [MediaService],
})
export class MediaModule {}
