import { ApiError } from "../utils/api-error";
import { requireEmail, requireString } from "../utils/validators";

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

export function parseRegisterDto(body: unknown): RegisterDto {
  const data = body as Record<string, unknown>;

  const password = requireString(data.password, "password");
  if (password.length < 8) {
    throw new ApiError(400, "password must be at least 8 characters");
  }

  return {
    name: requireString(data.name, "name"),
    email: requireEmail(data.email),
    password,
  };
}

export function parseLoginDto(body: unknown): LoginDto {
  const data = body as Record<string, unknown>;
  return {
    email: requireEmail(data.email),
    password: requireString(data.password, "password"),
  };
}

export function parseForgotPasswordDto(body: unknown): ForgotPasswordDto {
  const data = body as Record<string, unknown>;
  return {
    email: requireEmail(data.email),
  };
}

export function parseResetPasswordDto(body: unknown): ResetPasswordDto {
  const data = body as Record<string, unknown>;
  const email = requireEmail(data.email);
  const otp = requireString(data.otp, "otp");
  const newPassword = requireString(data.newPassword, "newPassword");

  if (!/^\d{6}$/.test(otp)) {
    throw new ApiError(400, "otp must be a 6-digit code");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "newPassword must be at least 8 characters");
  }

  return { email, otp, newPassword };
}
