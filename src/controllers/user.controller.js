import { asyncHandler } from "./../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export const loginUser = asyncHandler(async (req, res) => {});
