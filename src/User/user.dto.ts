import { ApiError } from "../utils/api-error";
import { requireEmail, requireString } from "../utils/validators";

export interface CreateAdminDto {
  name: string;
  email: string;
  password: string;
}

export const parseCreateAdminDto = (body: unknown): CreateAdminDto => {
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
};

