import { Request, Response } from "express";
import { parseCreateAdminDto } from "./user.dto";
import { createAdminUser, getCurrentUser } from "./user.service";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser?.userId;
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await getCurrentUser(userId);
  res.status(200).json({ user });
});

export const createAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseCreateAdminDto(req.body);
  const user = await createAdminUser(payload);
  res.status(201).json({
    message: "Admin account created successfully",
    user,
  });
});
