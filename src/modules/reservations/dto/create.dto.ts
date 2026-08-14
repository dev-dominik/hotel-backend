import { OmitType } from '@nestjs/swagger';
import { Reservation } from '@/modules/reservations/entity/reservation.entity';

export class CreateReservationRequest extends OmitType(Reservation, [
  'id',
  'createdAt',
  'deletedAt',
  'room',
  'status',
  'user',
  'userId',
  'totalPrice',
  'updatedAt',
  'nightsAmount',
  'amountPaid',
  'paymentDueAt',
]) {}
export class CreateReservationResponse extends Reservation {}
