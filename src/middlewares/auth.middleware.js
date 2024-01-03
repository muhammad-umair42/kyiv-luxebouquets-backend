import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { generateAccessTokenAndRefreshToken } from "../utils/generateTokens.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const isRequestAuthorized = asyncHandler(async (req, res, next) => {
  /*  this function have 2 secarios
  1.it will check if the access token is valid and not expired then it will check authorization and proceeds
  2.if access token is expired then
  3.it will check if the refresh token is valid and not expired then it will create new access token and refresh token and proceeds
  */
  //Getting Tokens from body

  const userAccessToken = req.cookies?.accessToken;
  console.log(userAccessToken);

  const userRefreshToken = req.cookies?.refreshToken;

  //If tokens not found in request
  if (!userAccessToken || !userRefreshToken) {
    throw new ApiError(404, "Auth Tokens missing");
  }

  //Checking if access token is valid otherwise creating new from refreshtoken

  try {
    //decoding Access Token

    const decodedAccessToken = jwt.verify(
      userAccessToken,
      process.env.ACCESS_TOKEN_SECRET,
    );

    //fetching user
    const user = await User.findById(decodedAccessToken._id).select(
      "-password",
    );

    //If user is not found
    if (!user) {
      throw new ApiError(404, "Invalid User");
    }

    //Checking if the same user is making request
    if (userRefreshToken !== user.refreshToken && user.isAdmin == false) {
      throw new ApiError(404, "UnAuthorized User");
    }

    req.user = user;
    next();
  } catch (error) {
    //if access token expired

    if (error.message === "jwt expired") {
      try {
        //checking refresh token

        const decodedRefreshToken = await jwt.verify(
          userRefreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );

        //Checking user
        const user = await User.findById(decodedRefreshToken._id);

        //if user is not found
        if (!user) {
          throw new ApiError(404, "Invalid User");
        }

        //if same user or admin is not sending request
        if (userRefreshToken !== user.refreshToken && user.isAdmin == false) {
          throw new ApiError(404, "UnAuthorized User");
        }

        //generating new access token and refresh token
        const { accessToken, refreshToken } =
          await generateAccessTokenAndRefreshToken(decodedRefreshToken._id);

        //getting user with new access token and refresh token
        const updatedUser = await User.findById(user._id).select(
          "-password -refreshToken",
        );

        //setting new access token and refresh token in cookies
        const options = {
          httpOnly: true,
          secure: true,
        };
        res
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options);

        //setting user in req to updated user and going next
        req.user = updatedUser;
        next();
      } catch (error) {
        //error for invalid or expired refresh token
        throw new ApiError(404, "Invalid or expired tokens", error);
      }
    } else {
      //if error is not because of expired access token
      throw new ApiError(
        500,
        "Invalid Access Token Or Internal Server Error",
        error,
      );
    }
  }
});

export const isUserAdmin = asyncHandler(async (req, res, next) => {
  //Getting Tokens from body

  const userAccessToken =
    req.cookies?.accessToken ||
    req.header("Authorization").replace("Bearer ", "");

  const userRefreshToken = req.cookies?.refreshToken;

  //If tokens not found in request
  if (!userAccessToken || !userRefreshToken) {
    throw new ApiError(404, "Auth Tokens missing");
  }

  //Checking if access token is valid otherwise creating new from refreshtoken

  try {
    //decoding Access Token

    const decodedAccessToken = jwt.verify(
      userAccessToken,
      process.env.ACCESS_TOKEN_SECRET,
    );

    //fetching user
    const user = await User.findById(decodedAccessToken._id).select(
      "-password",
    );

    //If user is not found
    if (!user) {
      throw new ApiError(404, "Invalid User");
    }

    //Checking if the same user is making request
    if (userRefreshToken !== user.refreshToken || user.isAdmin == false) {
      throw new ApiError(404, "User not Admin");
    }
    req.user = user;

    next();
  } catch (error) {
    //if access token expired

    if (error.message === "jwt expired") {
      try {
        //checking refresh token

        const decodedRefreshToken = await jwt.verify(
          userRefreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );

        //Checking user
        const user = await User.findById(decodedRefreshToken._id);

        //if user is not found
        if (!user) {
          throw new ApiError(404, "Invalid User");
        }

        //if same user or admin is not sending request
        if (userRefreshToken !== user.refreshToken || user.isAdmin == false) {
          throw new ApiError(404, "User not Admin");
        }

        //generating new access token and refresh token
        const { accessToken, refreshToken } =
          await generateAccessTokenAndRefreshToken(decodedRefreshToken._id);

        //getting user with new access token and refresh token
        const updatedUser = await User.findById(user._id).select(
          "-password -refreshToken",
        );

        //setting new access token and refresh token in cookies
        const options = {
          httpOnly: true,
          secure: true,
        };
        res
          .cookie("accessToken", accessToken, options)
          .cookie("refreshToken", refreshToken, options);

        //setting user in req to updated user and going next
        req.user = updatedUser;
        next();
      } catch (error) {
        //error for invalid or expired refresh token
        throw new ApiError(404, "UnAuthorized");
      }
    } else {
      //if error is not because of expired access token
      throw new ApiError(500, "Something went wrong");
    }
  }
});
