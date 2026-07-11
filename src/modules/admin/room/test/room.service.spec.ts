import { TestBed, type Mocked } from '@suites/unit';
import { AdminRoomService } from '../room.service';
import { Repository } from 'typeorm';
import { Room } from '../entity/room.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

describe('Admin Room Service Tests', () => {
  let service: AdminRoomService;
  let repo: Mocked<Repository<Room>>;

  const room: Room = {
    id: 'room-uuid',
    name: 'Deluxe Apartment',
    description: 'A luxurious apartment with sea view.',
    pricePerNight: 299.99,
    capacity: 4,
    isAvailable: true,
    amount: 10,
    amountAvailable: 10,
    mainImageUrl: 'https://example.com/uploads/rooms/main-image.webp',
    imageUrls: [
      'https://example.com/uploads/rooms/image-1.webp',
      'https://example.com/uploads/rooms/image-2.webp',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeAll(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(AdminRoomService).compile();

    service = unit;

    repo = unitRef.get<Mocked<Repository<Room>>>(
      getRepositoryToken(Room) as string,
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('insertRoom', () => {
    it('should insert and return the room when data is valid', async () => {
      const payload: Pick<
        Room,
        | 'name'
        | 'description'
        | 'pricePerNight'
        | 'capacity'
        | 'isAvailable'
        | 'amount'
        | 'mainImageUrl'
        | 'imageUrls'
      > = {
        name: 'New Room',
        description: 'A comfortable room.',
        pricePerNight: 150,
        capacity: 2,
        isAvailable: true,
        amount: 3,
        mainImageUrl: 'https://example.com/uploads/rooms/main.webp',
        imageUrls: [],
      };

      const saved: Room = { ...room, ...payload, id: 'new-uuid' };

      repo.findOne.mockResolvedValue(null);
      repo.save.mockResolvedValue(saved);

      const result = await service.insertRoom(payload);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { name: payload.name },
      });
      expect(repo.save).toHaveBeenCalledWith(payload);
      expect(result).toEqual(saved);
    });

    it('should throw ConflictException when trying to insert a room with an existing name', async () => {
      const createdRoom: Pick<
        Room,
        | 'name'
        | 'description'
        | 'pricePerNight'
        | 'capacity'
        | 'isAvailable'
        | 'amount'
        | 'mainImageUrl'
        | 'imageUrls'
      > = {
        name: room.name,
        description: 'A luxurious apartment with sea view.',
        pricePerNight: 299.99,
        capacity: 4,
        isAvailable: true,
        amount: 10,
        mainImageUrl: 'https://example.com/uploads/rooms/main-image.webp',
        imageUrls: [
          'https://example.com/uploads/rooms/image-1.webp',
          'https://example.com/uploads/rooms/image-2.webp',
        ],
      };

      repo.findOne.mockResolvedValue(room);

      await expect(service.insertRoom(createdRoom)).rejects.toThrow(
        ConflictException,
      );

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { name: createdRoom.name },
      });

      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when amount is 0', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.insertRoom({ ...room, amount: 0 })).rejects.toThrow(
        BadRequestException,
      );

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when capacity is 0', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.insertRoom({ ...room, capacity: 0 }),
      ).rejects.toThrow(BadRequestException);

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when pricePerNight is 0', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.insertRoom({ ...room, pricePerNight: 0 }),
      ).rejects.toThrow(BadRequestException);

      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('updateRoom', () => {
    it('should merge changes and return the updated room', async () => {
      const updated: Room = { ...room, name: 'Updated Name' };
      repo.findOne.mockResolvedValue(room);
      repo.save.mockResolvedValue(updated);

      const result = await service.updateRoom(room.id, {
        name: 'Updated Name',
      });

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: room.id } });
      expect(repo.save).toHaveBeenCalledWith({ ...room, name: 'Updated Name' });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when room does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.updateRoom('non-existent-id', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when amount is negative', async () => {
      repo.findOne.mockResolvedValue(room);

      await expect(service.updateRoom(room.id, { amount: -1 })).rejects.toThrow(
        BadRequestException,
      );

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when capacity is negative', async () => {
      repo.findOne.mockResolvedValue(room);

      await expect(
        service.updateRoom(room.id, { capacity: -1 }),
      ).rejects.toThrow(BadRequestException);

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when pricePerNight is negative', async () => {
      repo.findOne.mockResolvedValue(room);

      await expect(
        service.updateRoom(room.id, { pricePerNight: -1 }),
      ).rejects.toThrow(BadRequestException);

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should allow setting amount to 0', async () => {
      const updated: Room = { ...room, amount: 0 };
      repo.findOne.mockResolvedValue(room);
      repo.save.mockResolvedValue(updated);

      const result = await service.updateRoom(room.id, { amount: 0 });

      expect(repo.save).toHaveBeenCalled();
      expect(result.amount).toBe(0);
    });
  });

  describe('deleteRoom', () => {
    it('should remove the room when found', async () => {
      repo.findOne.mockResolvedValue(room);

      await service.deleteRoom(room.id);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: room.id } });
      expect(repo.remove).toHaveBeenCalledWith(room);
    });

    it('should throw NotFoundException when room does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.deleteRoom('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );

      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
