import { Controller, Patch, Request, UseGuards, Body, Post, Get, Delete, Param, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import type { Request as ExpressRequest } from 'express';
import { User, UserRole } from './entities/user.entity';

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

    @UseGuards(AuthenticatedGuard)
    @Get()
    async findAll(@Request() req: ExpressRequest): Promise<User[]> {
        const user = req.user as User;
        if (!user || user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Access denied');
        }
        return this.usersService.findAll();
    }

    @UseGuards(AuthenticatedGuard)
    @Post()
    async create(
        @Request() req: ExpressRequest,
        @Body() createUserDto: CreateUserByAdminDto,
    ): Promise<User> {
        const user = req.user as User;
        if (!user || user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Access denied');
        }
        if (createUserDto.role && createUserDto.role !== UserRole.PHARMACIST) {
            throw new ForbiddenException('Admin can only create pharmacist role');
        }
        return this.usersService.createByAdmin(createUserDto);
    }

    @UseGuards(AuthenticatedGuard)
    @Delete(':id')
    async remove(
        @Request() req: ExpressRequest,
        @Param('id') id: string,
    ): Promise<void> {
        const user = req.user as User;
        if (!user || user.role !== UserRole.ADMIN) {
            throw new ForbiddenException('Access denied');
        }
        return this.usersService.remove(id);
    }
}
