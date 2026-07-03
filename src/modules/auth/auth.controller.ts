import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import {
  GoogleAuthGuard,
  GoogleCallbackGuard,
} from './guards/google-auth.guard';
import {
  FacebookAuthGuard,
  FacebookCallbackGuard,
} from './guards/facebook-auth.guard';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import { ConfirmEmailRequest } from './dto/confirm-email.dto';
import type { ClientUser } from '@/modules/users/entity/user-client.entity';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() dto: RegisterRequest,
    @Ip() ip: string,
  ): Promise<ClientUser> {
    return await this.authService.register({ dto, ip });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginRequest })
  login(@Req() req: Request): ClientUser {
    if (!req.user) throw new Error('User not authenticated after login');

    return this.authService.toClientUser(req.user);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and destroy session' })
  logout(@Req() req: Request): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      req.logout((err: unknown) => {
        if (err)
          reject(err instanceof Error ? err : new Error('Logout failed'));
        else resolve();
      });
    });
  }

  @Post('confirm-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Confirm email address with token' })
  async confirmEmail(@Body() dto: ConfirmEmailRequest): Promise<void> {
    await this.authService.confirmEmail(dto.token);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  me(@Req() req: Request): ClientUser | null {
    if (!req.user) return null;
    return this.authService.toClientUser(req.user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  googleLogin(): void {}

  @Get('google/callback')
  @UseGuards(GoogleCallbackGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  googleCallback(@Res() res: Response): void {
    res.redirect('/');
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Initiate Facebook OAuth login' })
  facebookLogin(): void {}

  @Get('facebook/callback')
  @UseGuards(FacebookCallbackGuard)
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  facebookCallback(@Res() res: Response): void {
    res.redirect('/');
  }
}
