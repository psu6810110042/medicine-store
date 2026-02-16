import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(
    user: User,
    done: (err: Error | null, payload: string) => void,
  ): void {
    done(null, user.id); // Store only the user ID in the session
  }

  async deserializeUser(
    userId: string,
    done: (err: Error | null, payload: User | null) => void,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    done(null, user); // Retrieve the full user object from the database
  }
}
