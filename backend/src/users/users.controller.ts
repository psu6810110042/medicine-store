import { Body, Controller, ForbiddenException, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { Request as ExpressRequest } from 'express';
import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthenticatedGuard)
    @Post('admin/pharmacists')
    async createPharmacist(
        @Request() req: ExpressRequest,
        @Body() createUserDto: RegisterDto,
    ): Promise<User> {
        const user = req.user as User;
        if (!user || user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Access denied');
        }

        return this.usersService.createPharmacist(createUserDto);
    }

    @UseGuards(AuthenticatedGuard)
    @Patch('me')
    async updateProfile(
        @Request() req: ExpressRequest,
        @Body() updateProfileDto: UpdateProfileDto,
    ): Promise<User> {
        return this.usersService.update((req.user as User)!.id, updateProfileDto);
    }
}
