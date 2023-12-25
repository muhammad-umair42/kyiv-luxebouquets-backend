import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    contact: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    profilePic: {
      type: String,
      trim: true,
    },
    secretAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    subscribed: {
      type: Boolean,
      default: false,
    },
    specialEmails: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
