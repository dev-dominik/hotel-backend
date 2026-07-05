import { ApiProperty } from '@nestjs/swagger';
import { ClientUser } from '@/modules/users/entity/user-client.entity';

export class AdminUserDto extends ClientUser {}

export class PaginatedUsersResponse {
  @ApiProperty({ type: [AdminUserDto] }) items!: AdminUserDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
  @ApiProperty() totalPages!: number;
}
