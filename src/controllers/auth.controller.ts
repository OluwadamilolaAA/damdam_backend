import { Request, Response } from "express";
import {
  parseForgotPasswordDto,
  parseLoginDto,
  parseRegisterDto,
  parseResetPasswordDto,
} from "../dto/auth.dto";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "../utils/cookies";
import {
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword,
} from "../services/auth.service";
import { verifyRefreshToken } from "../utils/token";

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseRegisterDto(req.body);
  const result = await register(payload);

  res.status(201).json({
    message: "Registration successful. Please login.",
    user: result.user,
  });
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseLoginDto(req.body);
  const result = await login(payload);

  setRefreshTokenCookie(res, result.refreshToken);
  res.status(200).json({
    accessToken: result.accessToken,
    user: result.user,
  });
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (!refreshToken) {
    throw new ApiError(401, "Missing refresh token cookie");
  }

  const result = await refresh(refreshToken);
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json({
    accessToken: result.accessToken,
    user: result.user,
  });
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await logout(payload.sub);
    } catch {
      
    }
  }

  clearRefreshTokenCookie(res);
  res.status(200).json({ message: "Logged out successfully" });
});

export const forgotPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseForgotPasswordDto(req.body);
  await forgotPassword(payload.email);

  res.status(200).json({
    message: "If that email exists, a reset OTP has been sent.",
  });
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseResetPasswordDto(req.body);
  await resetPassword(payload.email, payload.otp, payload.newPassword);

  res.status(200).json({
    message: "Password reset successful. Please login again.",
  });
});
