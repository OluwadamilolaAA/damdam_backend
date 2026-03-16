import { Role } from "../modules/Auth/auth.model";

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        userId: string;
        role: Role;
      };
    }
  }
}

export {};
