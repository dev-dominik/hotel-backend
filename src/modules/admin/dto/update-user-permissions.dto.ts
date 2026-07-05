import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { Permission } from '@/modules/users/entity/user.permission';

export class UpdateUserPermissionsDto {
  @ApiProperty({
    enum: Permission,
    isArray: true,
    description: 'Full replacement list of permissions',
    example: [Permission.RESERVATIONS_READ, Permission.RESERVATIONS_WRITE],
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions!: Permission[];
}
