import { Module } from '@nestjs/common';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminRoomService } from './room.service';
import { AdminRoomController } from './room.controller';
import { Room } from './entity/room.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AppThrottlerModule } from '@/core/throttler/throttler.module';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), AppThrottlerModule],
  providers: [AdminRoomService, AdminGuard, AppThrottlerGuard],
  controllers: [AdminRoomController],
})
export class AdminRoomModule {}
