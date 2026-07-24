import { TestBed, type Mocked } from '@suites/unit';
import { ReservationsService } from '@/modules/reservations/reservations.service';
import { DataSource, Repository } from 'typeorm';
import { Reservation } from '@/modules/reservations/entity/reservation.entity';
import { ReservationStatus } from '@/modules/reservations/entity/reservation-status.enum';
import { PaymentType } from '@/modules/reservations/entity/payment-type.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { CreateReservationRequest } from '@/modules/reservations/dto/create.dto';
import { User } from '@/modules/users/entity/user.entity';
import { AuthProvider } from '@/modules/auth/entity/auth.provider';
import { UserRole } from '@/modules/users/entity/user.role';
import { Room } from '@/modules/admin/room/entity/room.entity';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

const user: User = {
  id: 'user-1',
  email: 'test@email.com',
  name: 'Test User',
  passwordHash: 'password',
  authProvider: AuthProvider.LOCAL,
  emailVerified: true,
  isBlocked: false,
  emailConfirmToken: null,
  role: UserRole.USER,
  permissions: [],
  lastLoginAt: new Date(),
  updatedAt: new Date(2026, 0, 1),
  createdAt: new Date(2026, 0, 1),
  deletedAt: null,
};

const room: Room = {
  id: 'room-1',
  name: 'Deluxe Suite',
  description: 'Spacious suite with sea view.',
  pricePerNight: 100,
  capacity: 4,
  isAvailable: true,
  amount: 2,
  amountAvailable: 2,
  mainImageUrl: 'https://example.com/main.jpg',
  imageUrls: [],
  createdAt: new Date(2026, 0, 1),
  updatedAt: new Date(2026, 0, 1),
  deletedAt: null,
};

type FakeManager = {
  findOne: jest.Mock;
  createQueryBuilder: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
};

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repo: Mocked<Repository<Reservation>>;
  let userRepo: Mocked<Repository<User>>;
  let dataSource: Mocked<DataSource>;
  let manager: FakeManager;

  beforeAll(async () => {
    const { unit, unitRef } =
      await TestBed.solitary(ReservationsService).compile();

    service = unit;

    repo = unitRef.get<Mocked<Repository<Reservation>>>(
      getRepositoryToken(Reservation) as string,
    );
    userRepo = unitRef.get<Mocked<Repository<User>>>(
      getRepositoryToken(User) as string,
    );
    dataSource = unitRef.get(DataSource);
  });

  beforeEach(() => {
    jest.clearAllMocks();

    userRepo.findOne.mockResolvedValue(user);

    manager = {
      findOne: jest.fn().mockResolvedValue(room),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      }),
      create: jest.fn(
        (_entity: unknown, data: Partial<Reservation>): Partial<Reservation> =>
          data,
      ),
      save: jest.fn(
        (data: Partial<Reservation>): Promise<Partial<Reservation>> =>
          Promise.resolve(data),
      ),
    };
    (dataSource.transaction as jest.Mock).mockImplementation(
      (cb: (manager: FakeManager) => Promise<unknown>) => cb(manager),
    );
  });

  describe('createReservation', () => {
    const baseDto = (): CreateReservationRequest => ({
      roomId: room.id,
      checkInDate: new Date('2026-08-01'),
      checkOutDate: new Date('2026-08-05'),
      adults: 2,
      children: 0,
      paymentType: PaymentType.FULL,
    });

    it('should create full-paid reservation', async () => {
      const dto: CreateReservationRequest = {
        roomId: room.id,
        checkInDate: new Date('2026-08-01'),
        checkOutDate: new Date('2026-08-05'),
        adults: 2,
        children: 0,
        paymentType: PaymentType.FULL,
      };

      const result = await service.createReservation(user.id, dto);

      expect(result).toMatchObject({
        userId: user.id,
        roomId: room.id,
        nightsAmount: 4,
        totalPrice: 400,
        paymentType: PaymentType.FULL,
        amountPaid: 400,
        status: ReservationStatus.CONFIRMED,
      });
      expect(repo.save).not.toHaveBeenCalled();
      expect(manager.save).toHaveBeenCalled();
    });

    it('should charge a 30% deposit, computed server-side, when paymentType is DEPOSIT', async () => {
      const result = await service.createReservation(user.id, {
        ...baseDto(),
        paymentType: PaymentType.DEPOSIT,
      });

      expect(result.paymentType).toBe(PaymentType.DEPOSIT);
      expect(result.totalPrice).toBe(400);
      expect(result.amountPaid).toBe(120);
    });

    it('should lock the room row for update while checking availability', async () => {
      await service.createReservation(user.id, baseDto());

      expect(manager.findOne).toHaveBeenCalledWith(Room, {
        where: { id: room.id },
        lock: { mode: 'pessimistic_write' },
      });
    });

    it('should query overlapping active reservations for the room and date range', async () => {
      await service.createReservation(user.id, baseDto());

      expect(manager.createQueryBuilder).toHaveBeenCalledWith(
        Reservation,
        'reservation',
      );

      const qb = manager.createQueryBuilder.mock.results[0].value as {
        where: jest.Mock;
        andWhere: jest.Mock;
      };
      expect(qb.where).toHaveBeenCalledWith('reservation.roomId = :roomId', {
        roomId: room.id,
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'reservation.status IN (:...statuses)',
        {
          statuses: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      );
    });

    it('should throw when the user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createReservation(user.id, baseDto()),
      ).rejects.toThrow('User not found!');
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the user is blocked', async () => {
      userRepo.findOne.mockResolvedValue({ ...user, isBlocked: true });

      await expect(
        service.createReservation(user.id, baseDto()),
      ).rejects.toThrow(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when check-in date is in the past', async () => {
      await expect(
        service.createReservation(user.id, {
          ...baseDto(),
          checkInDate: new Date('2020-01-01'),
        }),
      ).rejects.toThrow(BadRequestException);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when check-out is not after check-in', async () => {
      await expect(
        service.createReservation(user.id, {
          ...baseDto(),
          checkInDate: new Date('2026-08-05'),
          checkOutDate: new Date('2026-08-05'),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when the room does not exist', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(
        service.createReservation(user.id, baseDto()),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when the room is not available', async () => {
      manager.findOne.mockResolvedValue({ ...room, isAvailable: false });

      await expect(
        service.createReservation(user.id, baseDto()),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when guests exceed room capacity', async () => {
      await expect(
        service.createReservation(user.id, {
          ...baseDto(),
          adults: room.capacity + 1,
          children: 0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow guests exactly at room capacity', async () => {
      const result = await service.createReservation(user.id, {
        ...baseDto(),
        adults: room.capacity,
        children: 0,
      });

      expect(result.adults).toBe(room.capacity);
    });

    it('should throw ConflictException when the room is fully booked for the dates', async () => {
      manager.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(room.amount),
      });

      await expect(
        service.createReservation(user.id, baseDto()),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow booking when overlapping reservations are below room amount', async () => {
      manager.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(room.amount - 1),
      });

      await expect(
        service.createReservation(user.id, baseDto()),
      ).resolves.toBeDefined();
    });
  });

  describe('cancelReservation', () => {
    // cancelReservation mutates the entity it receives (`reservation.status = ...`)
    // before saving, so each test builds its own object — sharing one const across
    // tests would let an earlier mutation leak into later assertions.
    const makeReservation = (
      overrides: Partial<Reservation> = {},
    ): Reservation => ({
      id: 'reservation-1',
      roomId: room.id,
      room,
      userId: user.id,
      user,
      checkInDate: new Date('2099-01-01'),
      checkOutDate: new Date('2099-01-05'),
      adults: 2,
      children: 0,
      nightsAmount: 4,
      totalPrice: 400,
      paymentType: PaymentType.FULL,
      amountPaid: 400,
      status: ReservationStatus.CONFIRMED,
      createdAt: new Date(2026, 0, 1),
      updatedAt: new Date(2026, 0, 1),
      deletedAt: null,
      ...overrides,
    });

    it('should cancel a confirmed, upcoming reservation', async () => {
      const reservation = makeReservation();
      repo.findOne.mockResolvedValue(reservation);
      repo.save.mockResolvedValue({
        ...reservation,
        status: ReservationStatus.CANCELLED,
      });

      await service.cancelReservation(user.id, reservation.id);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: reservation.id },
        relations: { room: true },
      });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: ReservationStatus.CANCELLED }),
      );
    });

    it('should be a no-op when the reservation is already cancelled', async () => {
      repo.findOne.mockResolvedValue(
        makeReservation({ status: ReservationStatus.CANCELLED }),
      );

      await service.cancelReservation(user.id, 'reservation-1');

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the reservation is already completed', async () => {
      repo.findOne.mockResolvedValue(
        makeReservation({ status: ReservationStatus.COMPLETED }),
      );

      await expect(
        service.cancelReservation(user.id, 'reservation-1'),
      ).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the reservation already started', async () => {
      repo.findOne.mockResolvedValue(
        makeReservation({ checkInDate: new Date('2020-01-01') }),
      );

      await expect(
        service.cancelReservation(user.id, 'reservation-1'),
      ).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when cancelling a reservation owned by another user', async () => {
      repo.findOne.mockResolvedValue(
        makeReservation({ userId: 'someone-else' }),
      );

      await expect(
        service.cancelReservation(user.id, 'reservation-1'),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the reservation does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.cancelReservation(user.id, 'missing-id'),
      ).rejects.toThrow(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
