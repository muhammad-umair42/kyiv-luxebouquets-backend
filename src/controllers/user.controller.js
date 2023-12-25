import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessTokenAndRefreshToken } from "../utils/generateTokens.js";

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

export const logoutUser = asyncHandler(async (req, res) => {});
