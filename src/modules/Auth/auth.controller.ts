import { NextFunction, Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  parseForgotPasswordDto,
  parseLoginDto,
  parseRegisterDto,
  parseResetPasswordDto,
} from "./auth.dto";
import { asyncHandler } from "../../utils/async-handler";
import { ApiError } from "../../utils/api-error";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "../../utils/cookies";
import {
  forgotPassword,
  login,
  loginWithGoogle,
  logout,
  refresh,
  register,
  resetPassword,
} from "./auth.service";
import { env } from "../../config/env";
import { ensureGoogleOAuthConfigured } from "../../config/passport";
import { verifyRefreshToken } from "../../utils/token";

export const registerHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = parseRegisterDto(req.body);
    const result = await register(payload);

    res.status(201).json({
      message: "Registration successful. Please login.",
      user: result.user,
    });
  },
);

export const loginHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = parseLoginDto(req.body);
    const result = await login(payload);

    setRefreshTokenCookie(res, result.refreshToken);
    res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  },
);

export const refreshHandler = asyncHandler(
  async (req: Request, res: Response) => {
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
  },
);

export const logoutHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (refreshToken) {
      // Decode directly to still log out even if token is expired.
      // We don't care about it being verified here, we just want to remove exactly it from DB.
      const decoded = jwt.decode(refreshToken) as { sub?: string } | null;
      if (decoded && decoded.sub) {
        await logout(decoded.sub, refreshToken);
      }
    }

    clearRefreshTokenCookie(res);
    res.status(200).json({ message: "Logged out successfully" });
  },
);

export const forgotPasswordHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = parseForgotPasswordDto(req.body);
    await forgotPassword(payload.email);

    res.status(200).json({
      message: "If that email exists, a reset OTP has been sent.",
    });
  },
);

export const resetPasswordHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = parseResetPasswordDto(req.body);
    await resetPassword(payload.email, payload.otp, payload.newPassword);

    res.status(200).json({
      message: "Password reset successful. Please login again.",
    });
  },
);

const buildRedirectUrl = (
  baseUrl: string,
  params: Record<string, string>,
): string => {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
};

export const googleAuthHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  ensureGoogleOAuthConfigured();
  return passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
};

export const googleAuthCallbackHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  ensureGoogleOAuthConfigured();

  return passport.authenticate(
    "google",
    { session: false },
    async (error: unknown, profile: unknown) => {
      if (error || !profile) {
        const failureUrl = buildRedirectUrl(env.googleAuthFailureRedirect, {
          error: "google_auth_failed",
        });
        res.redirect(302, failureUrl);
        return;
      }

      try {
        const googleProfile = profile as {
          id?: string;
          displayName?: string;
          emails?: Array<{ value?: string }>;
        };

        const email = googleProfile.emails?.[0]?.value;
        if (!googleProfile.id || !email) {
          throw new ApiError(400, "Google account email is required");
        }

        const result = await loginWithGoogle({
          googleId: googleProfile.id,
          email,
          name: googleProfile.displayName || email.split("@")[0],
        });

        setRefreshTokenCookie(res, result.refreshToken);
        const successUrl = env.googleAuthSuccessRedirect;
        res.redirect(302, successUrl);
      } catch (_err) {
        const failureUrl = buildRedirectUrl(env.googleAuthFailureRedirect, {
          error: "google_auth_failed",
        });
        res.redirect(302, failureUrl);
      }
    },
  )(req, res, next);
};
