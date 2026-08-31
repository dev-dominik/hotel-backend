import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserRole } from '@/modules/users/entity/user.role';

export class UpdateRoleRequest {
  @ApiProperty({ enum: UserRole, description: 'New role for the user' })
  @IsEnum(UserRole)
  role!: UserRole;
}
