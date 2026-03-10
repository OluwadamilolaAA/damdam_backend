import passport from "passport";
import { Profile, Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env";
import { ApiError } from "../utils/api-error";

const isGoogleOAuthConfigured = () =>
  Boolean(env.googleClientId && env.googleClientSecret && env.googleCallbackUrl);

export const initializePassport = (): void => {
  if (!isGoogleOAuthConfigured()) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId as string,
        clientSecret: env.googleClientSecret as string,
        callbackURL: env.googleCallbackUrl as string,
      },
      (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
        done(null, profile);
      }
    )
  );
};

export const ensureGoogleOAuthConfigured = (): void => {
  if (!isGoogleOAuthConfigured()) {
    throw new ApiError(
      500,
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL."
    );
  }
};
