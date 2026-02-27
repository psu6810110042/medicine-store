import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../users/dto/register.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new BadRequestException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const newUser = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
        });

        const { password: _password, ...result } = newUser;
        return result as User;
    }

    async validateUser(email: string, pass: string): Promise<User | null> {
        const user = await this.usersService.findByEmail(email);

        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password: _password, ...result } = user;
            return result as User;
        }
        return null;
    }
}
