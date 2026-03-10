"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureGoogleOAuthConfigured = exports.initializePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const api_error_1 = require("../utils/api-error");
const isGoogleOAuthConfigured = () => Boolean(env_1.env.googleClientId && env_1.env.googleClientSecret && env_1.env.googleCallbackUrl);
const initializePassport = () => {
    if (!isGoogleOAuthConfigured()) {
        return;
    }
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: env_1.env.googleClientId,
        clientSecret: env_1.env.googleClientSecret,
        callbackURL: env_1.env.googleCallbackUrl,
    }, (_accessToken, _refreshToken, profile, done) => {
        done(null, profile);
    }));
};
exports.initializePassport = initializePassport;
const ensureGoogleOAuthConfigured = () => {
    if (!isGoogleOAuthConfigured()) {
        throw new api_error_1.ApiError(500, "Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.");
    }
};
exports.ensureGoogleOAuthConfigured = ensureGoogleOAuthConfigured;
