import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AppThrottlerGuard } from '@/core/throttler/throttler.guard';
import { PaymentService } from './payment.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CreatePaymentRequest, CreatePaymentResponse } from './dto/create.dto';
import { PaymentResponse } from './dto/payment.dto';
import { Payment } from './entity/payment.entity';
import { PaymentProvider } from './entity/payment.provider';

@ApiTags('payment')
@UseGuards(AppThrottlerGuard)
@Throttle({ auth: { limit: 60, ttl: 60_000 } })
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a payment and get the provider redirect URL',
  })
  @ApiResponse({ status: 201, type: CreatePaymentResponse })
  createPayment(
    @Body() dto: CreatePaymentRequest,
    @Req() req: Request,
  ): Promise<CreatePaymentResponse> {
    return this.paymentService.create({
      userId: req.user!.id,
      reservationId: dto.reservationId,
      provider: dto.provider,
    });
  }

  @Get(':id')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiResponse({ status: 200, type: PaymentResponse })
  async getPayment(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<PaymentResponse> {
    const payment = await this.paymentService.getPayment(id, req.user!.id);

    return this.toResponse(payment);
  }

  @Post('stripe/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe webhook — called by Stripe, not clients',
  })
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ success: true }> {
    if (!req.rawBody)
      throw new InternalServerErrorException('Raw body not available');

    await this.paymentService.handleWebhook(PaymentProvider.STRIPE, {
      rawBody: req.rawBody,
      headers: req.headers,
    });

    return { success: true };
  }

  private toResponse(payment: Payment): PaymentResponse {
    return {
      id: payment.id,
      reservationId: payment.reservationId,
      provider: payment.provider,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
    };
  }
}
