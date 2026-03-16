import mongoose, { Document, Model, Schema } from "mongoose";

export interface ProductDocument extends Document {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

ProductSchema.index({ name: "text", description: "text", category: "text" });

export const ProductModel: Model<ProductDocument> = mongoose.model<ProductDocument>(
  "Product",
  ProductSchema
);

export default ProductModel;
