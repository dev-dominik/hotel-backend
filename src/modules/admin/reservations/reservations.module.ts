import { Module } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';
import { AdminReservationsService } from './reservations.service';
import { AdminReservationsController } from './reservations.controller';

@Module({
  providers: [AdminReservationsService, AdminGuard],
  controllers: [AdminReservationsController],
})
export class AdminReservationsModule {}
