import {
  Controller,
  Post,
  Request,
  UseGuards,
  Body,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '../users/dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';

import type { Request as ExpressRequest } from 'express';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: ExpressRequest): User {
    return req.user as User;
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  getProfile(@Request() req: ExpressRequest): User {
    return req.user as User;
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  logout(@Request() req: ExpressRequest): { message: string } {
    req.session?.destroy((err) => {
      if (err) {
        console.error('Failed to destroy session:', err);
      }
    });
    return { message: 'Logged out successfully!' };
  }
}
