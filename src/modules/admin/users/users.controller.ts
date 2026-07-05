import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminGuard } from '../guards/admin.guard';
import { AdminUsersService } from './users.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { AdminUserDto, PaginatedUsersResponse } from './dto/admin-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';

@ApiTags('admin')
@UseGuards(AdminGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users (paginated)' })
  listUsers(
    @Query() query: ListUsersQueryDto,
  ): Promise<PaginatedUsersResponse> {
    return this.adminUsersService.listUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  getUser(@Param('id', ParseUUIDPipe) id: string): Promise<AdminUserDto> {
    return this.adminUsersService.getUser(id);
  }

  @Patch(':id/block')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Block a user' })
  blockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    return this.adminUsersService.blockUser(id, req.user!.id);
  }

  @Patch(':id/unblock')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unblock a user' })
  unblockUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminUsersService.unblockUser(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: "Update a user's role" })
  updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: Request,
  ): Promise<AdminUserDto> {
    return this.adminUsersService.updateUserRole(id, dto, req.user!.id);
  }

  @Patch(':id/permissions')
  @ApiOperation({ summary: "Update a user's permissions" })
  updateUserPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserPermissionsDto,
  ): Promise<AdminUserDto> {
    return this.adminUsersService.updateUserPermissions(id, dto);
  }
}
