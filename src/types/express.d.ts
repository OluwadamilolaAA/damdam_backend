import { Role } from "../models/user.model";

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
