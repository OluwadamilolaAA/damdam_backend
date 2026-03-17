import { Schema, model, Document } from "mongoose";

export interface CategoryDocument extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const CategoryModel = model<CategoryDocument>("Category", CategorySchema);