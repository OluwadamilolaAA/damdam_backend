import { ZodError, ZodType } from "zod";
import { ApiError } from "./api-error";

const formatIssuePath = (path: PropertyKey[]) =>
  path.length > 0 ? `${path.map((segment) => String(segment)).join(".")} ` : "";

export const parseWithSchema = <T>(schema: ZodType<T>, input: unknown): T => {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => ({
        path: issue.path.map((segment) => String(segment)).join("."),
        message: issue.message,
      }));
      const primary = error.issues[0];
      const message = primary
        ? `${formatIssuePath(primary.path)}${primary.message}`.trim()
        : "Invalid request data";
      throw new ApiError(400, message, details);
    }

    throw error;
  }
};
