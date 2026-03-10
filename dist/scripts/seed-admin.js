"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("../config/db");
const auth_model_1 = require("../Auth/auth.model");
dotenv_1.default.config();
const PASSWORD_HASH_ROUNDS = 12;
const getRequiredEnv = (key) => {
    const value = process.env[key];
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value.trim();
};
async function seedAdmin() {
    const name = getRequiredEnv("SEED_ADMIN_NAME");
    const email = getRequiredEnv("SEED_ADMIN_EMAIL").toLowerCase();
    const password = getRequiredEnv("SEED_ADMIN_PASSWORD");
    if (password.length < 8) {
        throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters");
    }
    await (0, db_1.connectDb)();
    const existingUser = await auth_model_1.UserModel.findOne({ email }).exec();
    const passwordHash = await bcrypt_1.default.hash(password, PASSWORD_HASH_ROUNDS);
    if (!existingUser) {
        await auth_model_1.UserModel.create({
            name,
            email,
            passwordHash,
            role: auth_model_1.Role.ADMIN,
        });
        console.log(`Admin user created: ${email}`);
        return;
    }
    existingUser.name = name;
    existingUser.passwordHash = passwordHash;
    existingUser.role = auth_model_1.Role.ADMIN;
    existingUser.isSuspended = false;
    await existingUser.save();
    console.log(`Existing user promoted/updated as admin: ${email}`);
}
seedAdmin()
    .then(async () => {
    await mongoose_1.default.disconnect();
    process.exit(0);
})
    .catch(async (error) => {
    console.error("Failed to seed admin:", error);
    await mongoose_1.default.disconnect();
    process.exit(1);
});
