import { Module } from '@nestjs/common';
import { AdminUsersModule } from './users/users.module';
import { AdminReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [AdminUsersModule, AdminReservationsModule],
})
export class AdminModule {}
