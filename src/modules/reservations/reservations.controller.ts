import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthenticatedGuard } from '@/modules/auth/guards/authenticated.guard';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entity/reservation.entity';
import {
  CreateReservationRequest,
  CreateReservationResponse,
} from './dto/create.dto';
import { DeleteReservationResponse } from './dto/delete.dto';
import {
  ListReservationsQuery,
  PaginatedReservationsResponse,
} from './dto/list.dto';

@ApiTags('reservations')
@UseGuards(AuthenticatedGuard, AppThrottlerGuard)
@Throttle({ auth: { limit: 60, ttl: 60_000 } })
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book a room' })
  @ApiResponse({ status: 201, type: CreateReservationResponse })
  createReservation(
    @Req() req: Request,
    @Body() dto: CreateReservationRequest,
  ): Promise<Reservation> {
    return this.reservationsService.createReservation(req.user!.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: "List the current user's reservations (paginated)",
  })
  @ApiResponse({ status: 200, type: PaginatedReservationsResponse })
  listReservations(
    @Req() req: Request,
    @Query() query: ListReservationsQuery,
  ): Promise<PaginatedReservationsResponse> {
    return this.reservationsService.listReservations(
      req.user!.id,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single reservation by ID' })
  @ApiResponse({ status: 200, type: CreateReservationResponse })
  getReservation(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Reservation> {
    return this.reservationsService.getReservation(req.user!.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a reservation' })
  @ApiResponse({ status: 204, type: DeleteReservationResponse })
  cancelReservation(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.reservationsService.cancelReservation(req.user!.id, id);
  }
}
