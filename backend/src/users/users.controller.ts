import { Controller, Patch, Request, UseGuards, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { Request as ExpressRequest } from 'express';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(AuthenticatedGuard)
  @Patch('me')
  async updateProfile(
    @Request() req: ExpressRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.update((req.user as User)!.id, updateProfileDto);
  }
}
