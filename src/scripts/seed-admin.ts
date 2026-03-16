import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDb } from "../config/db";
import { Role, UserModel } from "../modules/Auth/auth.model";

dotenv.config();

const PASSWORD_HASH_ROUNDS = 12;

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
};

async function seedAdmin(): Promise<void> {
  const name = getRequiredEnv("SEED_ADMIN_NAME");
  const email = getRequiredEnv("SEED_ADMIN_EMAIL").toLowerCase();
  const password = getRequiredEnv("SEED_ADMIN_PASSWORD");

  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters");
  }

  await connectDb();

  const existingUser = await UserModel.findOne({ email }).exec();
  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);

  if (!existingUser) {
    await UserModel.create({
      name,
      email,
      passwordHash,
      role: Role.ADMIN,
    });
    console.log(`Admin user created: ${email}`);
    return;
  }

  existingUser.name = name;
  existingUser.passwordHash = passwordHash;
  existingUser.role = Role.ADMIN;
  existingUser.isSuspended = false;
  await existingUser.save();

  console.log(`Existing user promoted/updated as admin: ${email}`);
}

seedAdmin()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Failed to seed admin:", error);
    await mongoose.disconnect();
    process.exit(1);
  });

