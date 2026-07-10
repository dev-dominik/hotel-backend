import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppThrottlerModule } from '@/core/throttler/throttler.module';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';
import { Room } from '../admin/room/entity/room.entity';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), AppThrottlerModule],
  controllers: [RoomsController],
  providers: [RoomsService, AppThrottlerGuard],
})
export class RoomsModule {}
