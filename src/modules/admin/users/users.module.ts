import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/users/entity/user.entity';
import { AdminGuard } from '@/core/guards/admin.guard';
import { AdminUsersService } from './users.service';
import { AdminUsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AdminUsersService, AdminGuard],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
