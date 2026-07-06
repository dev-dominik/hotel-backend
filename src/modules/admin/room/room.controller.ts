import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AdminRoomService } from './room.service';
import { CreateRoomRequest, CreateRoomResponse } from './dto/create.dto';
import { UpdateRoomRequest, UpdateRoomResponse } from './dto/update.dto';
import { DeleteRoomResponse } from './dto/delete.dto';

@ApiTags('admin')
@UseGuards(AdminGuard)
@Controller('admin/rooms')
export class AdminRoomController {
  constructor(private readonly adminRoomService: AdminRoomService) {}

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
