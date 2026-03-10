import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { CreateAdminDto } from "./user.dto";
import { Role, UserModel } from "../Auth/auth.model";
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

const PASSWORD_HASH_ROUNDS = 12;
const toUserId = (value: unknown): string => (value as Types.ObjectId).toString();

const sanitizeUser = (user: {
  _id: unknown;
  name: string;
  email: string;
  role: Role;
}) => ({
  id: toUserId(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
});

export const createAdminUser = async (input: CreateAdminDto) => {
  const existingUser = await UserModel.findOne({ email: input.email }).exec();
  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_HASH_ROUNDS);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: Role.ADMIN,
  });

  return sanitizeUser(user);
};
