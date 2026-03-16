import { z } from "zod";
import { parseWithSchema } from "../utils/zod";

const createAdminSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  email: z.string().trim().email("A valid email is required").toLowerCase(),
  password: z.string().trim().min(8, "password must be at least 8 characters"),
});

export type CreateAdminDto = z.infer<typeof createAdminSchema>;

export const parseCreateAdminDto = (body: unknown): CreateAdminDto => {
  return parseWithSchema(createAdminSchema, body);
};
