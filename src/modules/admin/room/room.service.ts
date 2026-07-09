import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entity/room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminRoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
  ) {}

  async listRooms(): Promise<Room[]> {
    return this.roomRepository.find({ order: { createdAt: 'ASC' } });
  }

  async insertRoom(
    room: Pick<
      Room,
      | 'name'
      | 'description'
      | 'pricePerNight'
      | 'capacity'
      | 'isAvailable'
      | 'amount'
      | 'mainImageUrl'
      | 'imageUrls'
    >,
  ): Promise<Room> {
    const existingRoom = await this.roomRepository.findOne({
      where: { name: room.name },
    });
    if (existingRoom)
      throw new ConflictException('Room with this name already exists');
    if (room.amount <= 0)
      throw new BadRequestException('Amount must be greater than 0');
    if (room.capacity <= 0)
      throw new BadRequestException('Capacity must be greater than 0');
    if (room.pricePerNight <= 0)
      throw new BadRequestException('Price per night must be greater than 0');

    return this.roomRepository.save(room);
  }

  async updateRoom(
    id: string,
    room: Partial<
      Pick<
        Room,
        | 'name'
        | 'description'
        | 'pricePerNight'
        | 'capacity'
        | 'isAvailable'
        | 'amount'
        | 'mainImageUrl'
        | 'imageUrls'
      >
    >,
  ): Promise<Room> {
    const existingRoom = await this.roomRepository.findOne({ where: { id } });
    if (!existingRoom) throw new NotFoundException('Room not found');
    if (room.amount !== undefined && room.amount < 0)
      throw new BadRequestException('Amount must be greater than 0');
    if (room.capacity !== undefined && room.capacity < 0)
      throw new BadRequestException('Capacity must be greater than 0');
    if (room.pricePerNight !== undefined && room.pricePerNight < 0)
      throw new BadRequestException('Price per night must be greater than 0');

    return this.roomRepository.save({ ...existingRoom, ...room });
  }

  async deleteRoom(id: string) {
    const existingRoom = await this.roomRepository.findOne({ where: { id } });
    if (!existingRoom) throw new NotFoundException('Room not found');

    await this.roomRepository.remove(existingRoom);
  }
}
