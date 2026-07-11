import { Module } from '@nestjs/common';
import { AdminUsersModule } from './users/users.module';
import { AdminRoomModule } from './room/room.module';

@Module({
  imports: [AdminUsersModule, AdminRoomModule],
})
export class AdminModule {}
