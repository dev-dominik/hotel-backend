import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payment.entity';
import { Reservation } from '../reservations/entity/reservation.entity';
import { AppThrottlerModule } from '@/core/throttler/throttler.module';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { UsersModule } from '../users/users.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentProviderResolver } from './payments.resolver';
import { StripeClient } from './provider/stripe/stripe.client';
import { StripeProvider } from './provider/stripe/stripe.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Reservation]),
    AppThrottlerModule,
    UsersModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentProviderResolver,
    StripeClient,
    StripeProvider,
    AuthenticatedGuard,
    AppThrottlerGuard,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
