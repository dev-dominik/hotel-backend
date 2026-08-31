import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/users/entity/user.entity';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminUsersController } from './users.controller';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule],
  providers: [AdminGuard],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
