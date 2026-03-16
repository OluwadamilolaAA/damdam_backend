import bcrypt from "bcrypt";
import crypto from "crypto";
import { Types } from "mongoose";
import { LoginDto, RegisterDto } from "./auth.dto";
import { Role, UserDocument, UserModel } from "./auth.model";
import { env } from "../../config/env";
import { ApiError } from "../../utils/api-error";
import { sendPasswordResetOtpEmail } from "../../utils/email";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/token";

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  refreshToken: string;
}

interface RegisterResponse {
  user: AuthResponse["user"];
}

export interface GoogleProfileInput {
  googleId: string;
  email: string;
  name: string;
}

const MAX_REFRESH_TOKENS_PER_USER = 5;
const REFRESH_HASH_ROUNDS = 12;
const PASSWORD_HASH_ROUNDS = 12;
const toUserId = (value: unknown): string =>
  (value as Types.ObjectId).toString();

const sanitizeUser = (user: UserDocument): AuthResponse["user"] => ({
  id: toUserId(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
});

const issueTokens = async (user: UserDocument): Promise<AuthResponse> => {
  const payload = { sub: toUserId(user._id), role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const refreshTokenHash = await bcrypt.hash(refreshToken, REFRESH_HASH_ROUNDS);

  const nextRefreshTokenHashes = [
    refreshTokenHash,
    ...user.refreshTokenHashes,
  ].slice(0, MAX_REFRESH_TOKENS_PER_USER);

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    { $set: { refreshTokenHashes: nextRefreshTokenHashes } },
    { returnDocument: "after" },
  ).exec();

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return {
    accessToken,
    refreshToken,
    user: sanitizeUser(updatedUser),
  };
};

export const register = async (
  input: RegisterDto,
): Promise<RegisterResponse> => {
  const existingUser = await UserModel.findOne({ email: input.email }).exec();
  if (existingUser) {
    throw new ApiError(409, "Email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, PASSWORD_HASH_ROUNDS);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: Role.USER,
  });

  return {
    user: sanitizeUser(user),
  };
};

export const login = async (input: LoginDto): Promise<AuthResponse> => {
  const user = await UserModel.findOne({ email: input.email }).exec();
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.passwordHash) {
    throw new ApiError(401, "Use Google login for this account");
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return issueTokens(user);
};

export const loginWithGoogle = async (
  profile: GoogleProfileInput,
): Promise<AuthResponse> => {
  let user = await UserModel.findOne({ googleId: profile.googleId }).exec();

  if (!user) {
    user = await UserModel.findOne({ email: profile.email }).exec();
  }

  if (!user) {
    user = await UserModel.create({
      name: profile.name,
      email: profile.email,
      googleId: profile.googleId,
      role: Role.USER,
    });
  } else if (!user.googleId) {
    user.googleId = profile.googleId;
    if (!user.name) {
      user.name = profile.name;
    }
    await user.save();
  }

  return issueTokens(user);
};

export const refresh = async (
  incomingRefreshToken: string,
): Promise<Omit<AuthResponse, "user"> & { user: AuthResponse["user"] }> => {
  const payload = verifyRefreshToken(incomingRefreshToken);
  const user = await UserModel.findById(payload.sub).exec();
  if (!user || user.refreshTokenHashes.length === 0) {
    throw new ApiError(401, "Invalid refresh token");
  }

  let isMatch = false;
  let matchedHash = "";
  for (const tokenHash of user.refreshTokenHashes) {
    if (await bcrypt.compare(incomingRefreshToken, tokenHash)) {
      isMatch = true;
      matchedHash = tokenHash;
      break;
    }
  }

  if (!isMatch) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // Proper token rotation: remove only the specific token hash that was just used
  // rather than clearing the array entirely, which would log the user out on all other devices.
  user.refreshTokenHashes = user.refreshTokenHashes.filter(
    (hash: string) => hash !== matchedHash,
  );
  return issueTokens(user);
};

export const logout = async (
  userId: string,
  incomingRefreshToken?: string,
): Promise<void> => {
  if (incomingRefreshToken) {
    // Only remove the token that is explicitly being logged out
    const user = await UserModel.findById(userId).exec();
    if (!user) return;

    const hashesToKeep = [];
    for (const tokenHash of user.refreshTokenHashes) {
      if (!(await bcrypt.compare(incomingRefreshToken, tokenHash))) {
        hashesToKeep.push(tokenHash);
      }
    }
    user.refreshTokenHashes = hashesToKeep;
    await user.save();
  } else {
    // Fallback if no token was provided, logs out of all devices
    await UserModel.findByIdAndUpdate(userId, {
      $set: { refreshTokenHashes: [] },
    }).exec();
  }
};

const hashOtp = (otp: string): string =>
  crypto.createHash("sha256").update(otp).digest("hex");

const generateOtpCode = (): string =>
  crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await UserModel.findOne({ email }).exec();

  // Always return success to avoid leaking whether an account exists.
  if (!user || !user.passwordHash) {
    return;
  }

  const otpCode = generateOtpCode();
  user.resetPasswordOtpHash = hashOtp(otpCode);
  user.resetPasswordOtpExpiresAt = new Date(
    Date.now() + env.passwordResetTtlMinutes * 60 * 1000,
  );
  await user.save();

  await sendPasswordResetOtpEmail(user.email, user.name, otpCode);
};

export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
): Promise<void> => {
  const otpHash = hashOtp(otp);
  const user = await UserModel.findOne({
    email,
    resetPasswordOtpHash: otpHash,
    resetPasswordOtpExpiresAt: { $gt: new Date() },
  }).exec();

  if (!user) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.passwordHash = await bcrypt.hash(newPassword, PASSWORD_HASH_ROUNDS);
  user.resetPasswordOtpHash = undefined;
  user.resetPasswordOtpExpiresAt = undefined;
  user.refreshTokenHashes = [];
  await user.save();
};
