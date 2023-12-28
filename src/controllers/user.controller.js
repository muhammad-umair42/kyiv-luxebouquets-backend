import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessTokenAndRefreshToken } from "../utils/generateTokens.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { set } from "mongoose";

export const registerNewUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password, secretAnswer } = req.body;
  console.log(req.body);
  if (
    [username, fullName, email, password, secretAnswer].some(
      field => field?.trim() === "",
    )
  ) {
    throw new ApiError(404, "All Fields are required");
  }

  console.log("Validations done");

  const existedUser = await User.findOne({ $or: [{ username }, { password }] });

  if (existedUser) {
    throw new ApiError(400, "User Already Existed");
  }

  console.log("Existed user checked");
  console.log(username, password, email, fullName);
  const user = await User.create({
    username,
    email,
    password,
    fullName,
    secretAnswer,
  });

  console.log("User created");

  const createdUser = await User.findById(user._id).select(
    "-password -isAdmin",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating a new user");
  }

  console.log("User created checked");

  res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(404, "Invalid username or email");
  }

  const isPasswordValid = user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Password");
  }

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!loggedInUser) {
    throw new ApiError(
      500,
      "Something went wrong while fetching loggedIn User",
    );
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged in successfully",
      ),
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );

  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User Logout Success"));
});

export const userForgotPassword = asyncHandler(async (req, res) => {
  const { email, secretAnswer, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.secretAnswer !== secretAnswer) {
    throw new ApiError(400, "Wrong Secret Answer");
  }

  user.password = newPassword;

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, user, "Password reset successfully"));
});

// User Crud Operations

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select(
    "username fullName _id profilePicture",
  );

  if (!users) {
    throw new ApiError(500, "Something went wrong while fetching users");
  }
  res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user_id = req.params.id;

  const user = await User.findById(user_id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(new ApiResponse(200, user, "user Fetched Successfully"));
});

export const updateUserProfilePicture = asyncHandler(async (req, res) => {
  const profilePictureLocalPath = req.file?.path;

  if (!profilePictureLocalPath) {
    throw new ApiError(400, "Please upload  picture");
  }

  const profilePictureURL = await uploadOnCloudinary(profilePictureLocalPath);

  if (!profilePictureURL.url) {
    throw new ApiError(
      500,
      "Something went wrong while uploading profile picture",
    );
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.profilePicture && user.profilePicture !== "") {
    const deleteExisting = await deleteFromCloudinary(user.profilePicture);

    if (deleteExisting === "error") {
      throw new ApiError(
        500,
        "Something went wrong while deleting old profile picture",
      );
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: { profilePicture: profilePictureURL.url },
    },
    { new: true },
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(
      new ApiResponse(200, { user: updatedUser }, "Profile picture updated"),
    );
});

export const updateUserDetails = asyncHandler(async (req, res) => {
  const { username, fullName, email, contact, secretAnswer, address } =
    req.body;

  if (
    [username, fullName, email, contact, secretAnswer, address].some(
      field => field.trim() === "",
    )
  ) {
    throw new ApiError(400, "All Fields are required");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        username: username,
        fullName: fullName,
        email: email,
        contact: contact,
        secretAnswer: secretAnswer,
        address: address,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(500, "Something went wrong while updating user");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, { user: updatedUser }, "User updated successfully"),
    );
});

export const updateUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword && !newPassword) {
    throw new ApiError(400, "Old Password and New Password are required");
  }

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid Password");
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        password: newPassword,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: updatedUser },
        "Password updated successfully",
      ),
    );
});

export const enableOrDisableSpecialEmails = asyncHandler(async (req, res) => {
  const { specialEmails } = req.body;

  if (specialEmails == undefined || specialEmails == "") {
    throw new ApiError(400, "Value is required");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        specialEmails: specialEmails,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  res.status(200).json(new ApiResponse(200, { user: updatedUser }, "success"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params.id;

  if (!id) throw new ApiError(404, "Id is required");

  await User.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});
