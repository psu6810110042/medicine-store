import { User } from '../src/users/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: {
        destroy(callback: (err: any) => void): void;
      };
    }
  }
}
