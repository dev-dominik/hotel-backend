import { TestBed, type Mocked } from '@suites/unit';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RoomsService } from '../rooms.service';
import { Room } from '../../admin/room/entity/room.entity';
import type { PublicRoomResponse } from '../dto/rooms.dto';

const room: Room = {
  id: 'room-uuid',
  name: 'Deluxe Suite',
  description: 'Spacious suite with sea view.',
  pricePerNight: 299.99,
  capacity: 4,
  isAvailable: true,
  amount: 5,
  amountAvailable: 3,
  mainImageUrl: 'https://example.com/main.jpg',
  imageUrls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const toExpectedResponse = (room: Room): PublicRoomResponse => ({
  id: room.id,
  name: room.name,
  description: room.description,
  pricePerNight: Number(room.pricePerNight),
  capacity: room.capacity,
  isAvailable: room.isAvailable,
  mainImageUrl: room.mainImageUrl,
  imageUrls: room.imageUrls,
});

const makeQb = () => ({
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
});

describe('RoomsService', () => {
  let service: RoomsService;
  let repo: Mocked<Repository<Room>>;

  beforeAll(async () => {
    const { unit, unitRef } = await TestBed.solitary(RoomsService).compile();

    service = unit;

    repo = unitRef.get<Mocked<Repository<Room>>>(
      getRepositoryToken(Room) as string,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listRooms', () => {
    it('should return paginated available rooms with defaults', async () => {
      const rooms = [
        room,
        { ...room, id: 'room-uuid-2', name: 'Standard Room' },
      ];
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([rooms, 2]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.listRooms();

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('room');
      expect(qb.where).toHaveBeenCalledWith('room.isAvailable = :isAvailable', {
        isAvailable: true,
      });
      expect(qb.andWhere).not.toHaveBeenCalled();
      expect(qb.orderBy).toHaveBeenCalledWith('room.createdAt', 'ASC');
      expect(qb.skip).toHaveBeenCalledWith(0);
      expect(qb.take).toHaveBeenCalledWith(6);

      expect(result).toEqual({
        items: rooms.map(toExpectedResponse),
        total: 2,
        page: 1,
        limit: 6,
        totalPages: 1,
      });
    });

    it('should apply capacity filter when provided', async () => {
      const rooms = [{ ...room, capacity: 4 }];
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([rooms, 1]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      await service.listRooms(4);

      expect(qb.andWhere).toHaveBeenCalledWith('room.capacity >= :capacity', {
        capacity: 4,
      });
    });

    it('should not apply capacity filter when capacity is undefined', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      await service.listRooms(undefined);

      expect(qb.andWhere).not.toHaveBeenCalled();
    });

    it('should calculate correct skip offset for page 2', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      await service.listRooms(undefined, 2, 6);

      expect(qb.skip).toHaveBeenCalledWith(6);
      expect(qb.take).toHaveBeenCalledWith(6);
    });

    it('should calculate totalPages correctly', async () => {
      const rooms = Array.from({ length: 6 }, (_, index) => ({
        ...room,
        id: `room-uuid-${index + 1}`,
      }));
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([rooms, 13]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.listRooms(undefined, 1, 6);

      expect(result.total).toBe(13);
      expect(result.totalPages).toBe(3);
    });

    it('should return empty items when no available rooms exist', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.listRooms();

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should respect custom limit', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      await service.listRooms(undefined, 1, 12);

      expect(qb.take).toHaveBeenCalledWith(12);
    });

    it('should map room fields to public response shape (no internal fields)', async () => {
      const qb = makeQb();
      qb.getManyAndCount.mockResolvedValue([[room], 1]);
      repo.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.listRooms();
      const item = result.items[0];

      expect(item).not.toHaveProperty('amount');
      expect(item).not.toHaveProperty('amountAvailable');
      expect(item).not.toHaveProperty('createdAt');
      expect(item.pricePerNight).toBe(Number(room.pricePerNight));
    });
  });

  describe('getRoom', () => {
    it('should return the public room response when found', async () => {
      repo.findOne.mockResolvedValue(room);

      const result = await service.getRoom(room.id);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: room.id } });
      expect(result).toEqual(toExpectedResponse(room));
    });

    it('should throw NotFoundException when room does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.getRoom('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });

    it('should cast pricePerNight to number', async () => {
      const testRoom = {
        ...room,
        pricePerNight: '199.99' as unknown as number,
      };
      repo.findOne.mockResolvedValue(testRoom);

      const result = await service.getRoom(testRoom.id);

      expect(typeof result.pricePerNight).toBe('number');
      expect(result.pricePerNight).toBe(199.99);
    });

    it('should not expose internal fields in the response', async () => {
      repo.findOne.mockResolvedValue(room);

      const result = await service.getRoom(room.id);

      expect(result).not.toHaveProperty('amount');
      expect(result).not.toHaveProperty('amountAvailable');
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('updatedAt');
    });
  });
});
