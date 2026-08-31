import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminUserDto } from '../../users/dto/admin-user.dto';
import { UpdateRoleRequest } from './dto/update-role.dto';
import { UpdatePermissionsRequest } from './dto/update-permissions.dto';
import { UsersService } from '@/modules/users/users.service';
import { ListQuery, ListResponse } from './dto/list.dto';

@ApiTags('admin')
@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users (paginated)' })
  async listUsers(@Query() query: ListQuery): Promise<ListResponse> {
    const users = await this.usersService.search(
      {
        email: query.search,
        name: query.search,
        role: query.role,
        isBlocked: query.isBlocked,
      },
      query.page ?? 1,
      query.limit ?? 20,
    );

    return {
      items: users.items.map((user) => this.usersService.toAdminUser(user)),
      total: users.total,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      totalPages: Math.ceil(users.total / (query.limit ?? 20)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  async getUser(@Param('id', ParseUUIDPipe) id: string): Promise<AdminUserDto> {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    return this.usersService.toAdminUser(user);
  }

  @Patch(':id/block')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Block a user' })
  async blockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    if (req.user!.id === id)
      throw new NotFoundException('You cannot block yourself');

    await this.usersService.block(id);
  }

  @Patch(':id/unblock')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unblock a user' })
  async unblockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    if (req.user!.id === id)
      throw new NotFoundException('You cannot unblock yourself');

    await this.usersService.unblock(id);
  }

  @Patch(':id/role')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Update a user's role" })
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleRequest,
    @Req() req: Request,
  ): Promise<AdminUserDto> {
    if (req.user!.id === id)
      throw new NotFoundException('You cannot update your own role');

    return await this.usersService.updateRole(id, dto.role);
  }

  @Patch(':id/permissions')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Update a user's permissions" })
  async updateUserPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissionsRequest,
    @Req() req: Request,
  ): Promise<AdminUserDto> {
    if (req.user!.id === id)
      throw new NotFoundException('You cannot update your own permissions');

    return await this.usersService.updatePermissions(id, dto.permissions);
  }
}
