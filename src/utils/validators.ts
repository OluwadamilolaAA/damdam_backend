import { ApiError } from "./api-error";
import { Types } from "mongoose";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, `${field} is required`);
  }
  return value.trim();
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, "email").toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, "A valid email is required");
  }
  return email;
}

export function requireEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new ApiError(400, `${field} must be one of: ${allowed.join(", ")}`);
  }
  return value as T;
}

export function requireObjectId(value: unknown, field: string): string {
  const raw = requireString(value, field);
  if (!Types.ObjectId.isValid(raw)) {
    throw new ApiError(400, `${field} must be a valid id`);
  }
  return raw;
}

export function requirePositiveInt(value: unknown, field: string): number {
  if (
    typeof value !== "number" ||
    Number.isNaN(value) ||
    !Number.isInteger(value) ||
    value < 1
  ) {
    throw new ApiError(400, `${field} must be a positive integer`);
  }
  return value;
}
