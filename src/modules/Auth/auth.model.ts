import mongoose, { Document, Model, Schema } from "mongoose";

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: Role;
  isSuspended: boolean;
  googleId?: string;
  refreshTokenHashes: string[];
  resetPasswordOtpHash?: string;
  resetPasswordOtpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    isSuspended: { type: Boolean, default: false },
    googleId: { type: String },
    refreshTokenHashes: { type: [String], default: [] },
    resetPasswordOtpHash: { type: String },
    resetPasswordOtpExpiresAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  UserSchema
);

export default UserModel;
