import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ProductDocument extends Document {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, unique:true, lowercase:true, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, versionKey: false }
);
ProductSchema.index({ price: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ createdAt: -1 });

ProductSchema.index({ name: "text", description: "text" });

export const ProductModel: Model<ProductDocument> = mongoose.model<ProductDocument>(
  "Product",
  ProductSchema
);

export default ProductModel;
