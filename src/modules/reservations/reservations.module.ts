import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppThrottlerModule } from '@/core/throttler/throttler.module';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';
import { AuthenticatedGuard } from '@/modules/auth/guards/authenticated.guard';
import { Room } from '@/modules/admin/room/entity/room.entity';
import { Reservation } from './entity/reservation.entity';
import { ReservationsService } from './reservations.service';
import { ReservationsScheduler } from './reservations.scheduler';
import { ReservationsController } from './reservations.controller';
import { User } from '@/modules/users/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Room, User]),
    AppThrottlerModule,
  ],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReservationsScheduler,
    AuthenticatedGuard,
    AppThrottlerGuard,
  ],
})
export class ReservationsModule {}
