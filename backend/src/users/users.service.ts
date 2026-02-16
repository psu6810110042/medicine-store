import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto'; // Or your RegisterDto
import { UpdateProfileDto } from './dto/update-profile.dto'; // For profile updates

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  // 1. Create a new user (Used by Auth Service)
  async create(createUserDto: RegisterDto): Promise<User> {
    const { phoneNumber, ...rest } = createUserDto;
    const newUser = this.usersRepository.create({
      ...rest,
      phone: phoneNumber,
    });
    return this.usersRepository.save(newUser);
  }

  // 2. Find by Email (CRITICAL for Auth)
  // We must explicitly select the password because it is hidden by default in the Entity
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      // Explicitly select the password hash so bcrypt can compare it
      select: ['id', 'email', 'password', 'fullName', 'phone', 'role'],
    });
  }

  // 3. Find by ID (Used for 'Get Profile' / 'Me' endpoint)
  // This will NOT return the password, which is safe for frontend
  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // 4. Update Profile (Used for "Fill details later")
  async update(id: string, updateUserDto: UpdateProfileDto): Promise<User> {
    // Preload creates a new entity from the DTO mixed with the given ID
    // This is useful because it checks if the entity exists first
    const user = await this.usersRepository.preload({
      id: id,
      ...updateUserDto,
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return this.usersRepository.save(user);
  }
}
