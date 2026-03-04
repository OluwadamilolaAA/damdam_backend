import { UserModel } from "../models/user.model";
import { ApiError } from "../utils/api-error";

export const getCurrentUser = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .select("-passwordHash -refreshTokenHashes -resetPasswordOtpHash -resetPasswordOtpExpiresAt")
    .exec();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};
