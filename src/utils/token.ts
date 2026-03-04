import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "./api-error";

interface JwtPayload {
  sub: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessTtl as SignOptions["expiresIn"],
  } as SignOptions);

export const generateRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl as SignOptions["expiresIn"],
  } as SignOptions);

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};
