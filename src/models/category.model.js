import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    categoryImage: {
      type: String,
      required: true,
      trim: true,
    },
    categoryProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true },
);

export const Category = mongoose.model("Category", categorySchema);
