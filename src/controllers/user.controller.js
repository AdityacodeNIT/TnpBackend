import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshtoken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, phoneNumber, role } = req.body;
console.log(req.body);
  // Validate required fields
  if (
    [fullName, email, username, password, phoneNumber].some(
      (field) => !field?.trim()
    )
  ) {
    throw new ApiError(400, "All fields are compulsory");
  }

  // Check for existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Handle avatar upload
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  // 🔒 Restrict role assignment — prevent manual "admin" role
  const safeRole = role === "admin" ? "user" : role || "user";

  // Create user
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    phoneNumber,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "Registered successfully"));
});

// ✅ LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
console.log(req.body);
  if (!email && !password) {
    throw new ApiError(400, "Email and password are required");
   
  }

  const user = await User.findOne({
    $or: [{ email }, { password}],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshtoken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// ✅ REFRESH ACCESS TOKEN
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized Request");
  }

  try {
      // Verify the refresh token
      const decodedToken = Jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      );

      // Find the user based on the ID from the refresh token
      const user = await User.findById(decodedToken?._id);
      if (!user) {
          throw new ApiError(401, "Invalid refresh token");
      }

      // 🔴 Check if the refresh token matches the one stored in the database
      if (incomingRefreshToken !== user.refreshToken) {
          throw new ApiError(401, "Refresh token is expired or does not match");
      }

      // Here, check if the access token has expired (you can store the expiration time in the JWT payload)
      const currentAccessToken = req.cookies.accessToken;  // Assuming you have access to the current access token
      try {
          Jwt.verify(currentAccessToken, process.env.ACCESS_TOKEN_SECRET);  // Try to verify it
          
          return res.status(200).json(new ApiResponse(200, "Access token is still valid"));
      } catch (err) {
          // If the access token is invalid or expired, generate a new one
          const { accessToken } = await user.generateAccessToken();
          
          // Send the new access token as a cookie and in the response
          const options = {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production", // Only true in production for HTTPS
              sameSite: "None",
          };

          return res
              .status(200)
              .cookie("accessToken", accessToken, options)  // Set the new access token cookie
              .json(new ApiResponse(200, { accessToken }, "Access token refreshed successfully"));
      }
  } catch (error) {
      console.error("Error during token refresh:", error);

      if (error.name === "TokenExpiredError") {
          throw new ApiError(401, "Refresh token expired. Please log in again.");
      }

      throw new ApiError(401, error.message || "Invalid refresh token");
  }
});



// ✅ LOGOUT USER
const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(0),
  };

  return res
    .status(200)
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, refreshAccessToken, logoutUser };
