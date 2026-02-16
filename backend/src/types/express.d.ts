// src/types/express.d.ts
// This file augments the Express Request type to include properties added by Passport.

import { User } from '../src/users/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User; // Passport adds the authenticated user to req.user
      session?: {
        destroy(callback: (err: any) => void): void;
      };
    }
  }
}
