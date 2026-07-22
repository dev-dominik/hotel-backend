import { PickType } from '@nestjs/swagger';
import { Reservation } from '../entity/reservation.entity';
import { SuccessResponse } from '@/core/http/success.response';

export class DeleteReservationRequest extends PickType(Reservation, ['id']) {}
export class DeleteReservationResponse extends SuccessResponse {}
