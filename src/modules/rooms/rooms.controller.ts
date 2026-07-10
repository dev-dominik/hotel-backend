import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';
import { RoomsService } from './rooms.service';
import {
  ListRoomsQuery,
  PaginatedRoomsResponse,
  PublicRoomResponse,
} from './dto/rooms.dto';

@ApiTags('rooms')
@UseGuards(AppThrottlerGuard)
@Throttle({ auth: { limit: 120, ttl: 60_000 } })
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @ApiOperation({
    summary: 'List available rooms (paginated, optional capacity filter)',
  })
  @ApiResponse({ status: 200, type: PaginatedRoomsResponse })
  listRooms(@Query() query: ListRoomsQuery): Promise<PaginatedRoomsResponse> {
    return this.roomsService.listRooms(query.capacity, query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single room by ID' })
  @ApiResponse({ status: 200, type: PublicRoomResponse })
  getRoom(@Param('id', ParseUUIDPipe) id: string): Promise<PublicRoomResponse> {
    return this.roomsService.getRoom(id);
  }
}
