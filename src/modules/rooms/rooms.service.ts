import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../admin/room/entity/room.entity';
import type {
  PaginatedRoomsResponse,
  PublicRoomResponse,
} from './dto/rooms.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async listRooms(
    capacity?: number,
    page = 1,
    limit = 6,
  ): Promise<PaginatedRoomsResponse> {
    const qb = this.roomRepository
      .createQueryBuilder('room')
      .where('room.isAvailable = :isAvailable', { isAvailable: true });
    if (capacity) qb.andWhere('room.capacity >= :capacity', { capacity });

    const [rooms, total] = await qb
      .orderBy('room.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: rooms.map((room) => this.toResponse(room)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
