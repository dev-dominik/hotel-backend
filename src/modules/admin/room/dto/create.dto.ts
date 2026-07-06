import { PickType } from '@nestjs/swagger';
import { Room } from '../entity/room.entity';

export class CreateRoomRequest extends PickType(Room, [
  'name',
  'description',
  'pricePerNight',
  'capacity',
  'isAvailable',
  'amount',
  'mainImageUrl',
  'imageUrls',
]) {}
export class CreateRoomResponse extends Room {}
