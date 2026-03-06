import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional, IsIn } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserByAdminDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsIn([UserRole.PHARMACIST])
    @IsOptional()
    role?: UserRole;
}
