import { Request, Response } from "express";
import { getCurrentUser } from "../services/user.service";
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
