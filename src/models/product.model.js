import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    productImage: {
      type: String,
      required: true,
      trim: true,
    },
    combinations: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);
