import { NextFunction, Request, Response } from "express";
import { Role } from "../modules/Auth/auth.model";
import { ApiError } from "../utils/api-error";
import { verifyAccessToken } from "../utils/token";

export interface AuthUser {
  userId: string;
  role: Role;
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing Bearer token");
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const payload = verifyAccessToken(token);

  req.authUser = {
    userId: payload.sub,
    role: payload.role as Role,
  };

  next();
};

export const requireRole =
  (...allowedRoles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      throw new ApiError(403, "Forbidden");
    }

    next();
  };
