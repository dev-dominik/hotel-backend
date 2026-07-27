import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';
import { AdminGuard } from '@/core/guards/admin.guard';
import { AdminRoomService } from './room.service';
import { CreateRoomRequest, CreateRoomResponse } from './dto/create.dto';
import { UpdateRoomRequest, UpdateRoomResponse } from './dto/update.dto';
import { DeleteRoomResponse } from './dto/delete.dto';
import {
  ListAdminRoomsQuery,
  PaginatedAdminRoomsResponse,
} from './dto/list.dto';
@ApiTags('admin')
@UseGuards(AdminGuard, AppThrottlerGuard)
@Throttle({ auth: { limit: 60, ttl: 60_000 } })
@Controller('admin/rooms')
export class AdminRoomController {
  constructor(private readonly adminRoomService: AdminRoomService) {}

  @Get()
  @ApiOperation({ summary: 'List all room types (paginated)' })
  @ApiResponse({ status: 200, type: PaginatedAdminRoomsResponse })
  listRooms(
    @Query() query: ListAdminRoomsQuery,
  ): Promise<PaginatedAdminRoomsResponse> {
    return this.adminRoomService.listRooms(query.page, query.limit);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new room type' })
  @ApiResponse({ status: 201, type: CreateRoomResponse })
  createRoom(@Body() dto: CreateRoomRequest): Promise<CreateRoomResponse> {
    return this.adminRoomService.insertRoom(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room type' })
  @ApiResponse({ status: 200, type: UpdateRoomResponse })
  updateRoom(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoomRequest,
  ): Promise<UpdateRoomResponse> {
    return this.adminRoomService.updateRoom(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a room type' })
  @ApiResponse({ status: 204, type: DeleteRoomResponse })
  deleteRoom(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.adminRoomService.deleteRoom(id);
  }
}
