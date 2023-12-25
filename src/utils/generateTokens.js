import { ApiError } from "./ApiError.js";
import { User } from "../models/user.model.js";

export const generateAccessTokenAndRefreshToken = async userId => {
  try {
    const user = await User.findById({ _id: userId });
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Something went wrong Generating Tokens", {
      error,
    });
  }
};
