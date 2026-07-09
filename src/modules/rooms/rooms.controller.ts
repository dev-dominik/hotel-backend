import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { ListRoomsQuery, PublicRoomResponse } from './dto/rooms.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({
    summary: 'List available rooms, optionally filtered by capacity',
  })
  @ApiResponse({ status: 200, type: [PublicRoomResponse] })
  listRooms(@Query() query: ListRoomsQuery): Promise<PublicRoomResponse[]> {
    return this.roomsService.listRooms(query.capacity);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single room by ID' })
  @ApiResponse({ status: 200, type: PublicRoomResponse })
  getRoom(@Param('id', ParseUUIDPipe) id: string): Promise<PublicRoomResponse> {
    return this.roomsService.getRoom(id);
  }
}
