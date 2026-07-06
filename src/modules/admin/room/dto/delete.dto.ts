import { PickType } from '@nestjs/swagger';
import { Room } from '../entity/room.entity';
import { SuccessResponse } from '@/core/http/success.response';

export class DeleteRoomRequest extends PickType(Room, ['id']) {}
export class DeleteRoomResponse extends SuccessResponse {}
