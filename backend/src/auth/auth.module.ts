import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // 👈 Import this
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy'; // If you have this
import { SessionSerializer } from './session.serializer'; // If you have this

@Module({
  imports: [
    UsersModule, // 👈 ADD THIS LINE
    PassportModule.register({ session: true }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
