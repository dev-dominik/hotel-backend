import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.startegy';
import { SessionSerializer } from './serializers/session.serializer';
import { UsersModule } from '@/modules/users/users.module';
import { User } from '@/modules/users/entity/user.entity';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule.register({ session: true }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer],
  exports: [SessionSerializer],
})
export class AuthModule {}
