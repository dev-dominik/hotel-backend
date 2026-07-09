import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../admin/room/entity/room.entity';
import type { PublicRoomResponse } from './dto/rooms.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async listRooms(capacity?: number): Promise<PublicRoomResponse[]> {
    const qb = this.roomRepository
      .createQueryBuilder('room')
      .where('room.isAvailable = :isAvailable', { isAvailable: true });
    if (capacity) qb.andWhere('room.capacity >= :capacity', { capacity });

    const rooms = await qb.orderBy('room.createdAt', 'ASC').getMany();
    return rooms.map((r) => this.toResponse(r));
  }

  async getRoom(id: string): Promise<PublicRoomResponse> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    return this.toResponse(room);
  }

  private toResponse(room: Room): PublicRoomResponse {
    return {
      id: room.id,
      name: room.name,
      description: room.description,
      pricePerNight: Number(room.pricePerNight),
      capacity: room.capacity,
      isAvailable: room.isAvailable,
      mainImageUrl: room.mainImageUrl,
      imageUrls: room.imageUrls,
    };
  }
}
