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
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { AdminUserDto, PaginatedUsersResponse } from './dto/admin-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';

@ApiTags('admin')
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users (paginated)' })
  listUsers(
    @Query() query: ListUsersQueryDto,
  ): Promise<PaginatedUsersResponse> {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  getUser(@Param('id', ParseUUIDPipe) id: string): Promise<AdminUserDto> {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/block')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Block a user' })
  blockUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    return this.adminService.blockUser(id, req.user!.id);
  }

  @Patch('users/:id/unblock')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unblock a user' })
  unblockUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminService.unblockUser(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: "Update a user's role" })
  updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: Request,
  ): Promise<AdminUserDto> {
    return this.adminService.updateUserRole(id, dto, req.user!.id);
  }

  @Patch('users/:id/permissions')
  @ApiOperation({ summary: "Update a user's permissions" })
  updateUserPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserPermissionsDto,
  ): Promise<AdminUserDto> {
    return this.adminService.updateUserPermissions(id, dto);
  }
}
