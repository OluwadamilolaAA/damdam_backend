import { z } from "zod";
import { parseWithSchema } from "../../utils/zod";

const registerSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z.string().trim().min(8, "password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z.string().trim().min(1, "password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("A valid email is required").toLowerCase(),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  otp: z.string().trim().regex(/^\d{6}$/, "otp must be a 6-digit code"),
  newPassword: z
    .string()
    .trim()
    .min(8, "newPassword must be at least 8 characters"),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export function parseRegisterDto(body: unknown): RegisterDto {
  return parseWithSchema(registerSchema, body);
}

export function parseLoginDto(body: unknown): LoginDto {
  return parseWithSchema(loginSchema, body);
}

export function parseForgotPasswordDto(body: unknown): ForgotPasswordDto {
  return parseWithSchema(forgotPasswordSchema, body);
}

export function parseResetPasswordDto(body: unknown): ResetPasswordDto {
  return parseWithSchema(resetPasswordSchema, body);
}
