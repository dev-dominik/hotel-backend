import { OmitType, PartialType } from '@nestjs/swagger';
import { Room } from '../entity/room.entity';

export class UpdateRoomRequest extends PartialType(
  OmitType(Room, ['id', 'createdAt', 'updatedAt', 'deletedAt']),
) {}

export class UpdateRoomResponse extends Room {}
