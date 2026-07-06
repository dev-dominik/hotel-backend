import { Module } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { AdminRoomService } from './room.service';
import { AdminRoomController } from './room.controller';

@Module({
  providers: [AdminRoomService, AdminGuard],
  controllers: [AdminRoomController],
})
export class AdminRoomModule {}
