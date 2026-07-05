import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AdminReservationsService } from './reservations.service';

@ApiTags('admin')
@UseGuards(AdminGuard)
@Controller('admin/reservations')
export class AdminReservationsController {
  constructor(
    private readonly adminReservationsService: AdminReservationsService,
  ) {}
}
