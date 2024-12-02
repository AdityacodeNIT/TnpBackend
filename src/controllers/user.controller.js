import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshtoken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    // Log the original error for debugging purposes
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
// Register User
const registerUser = asyncHandler(async (req, res) => {
  try {
    // Destructure request body
    const { fullName, email, username, password, phoneNumber } = req.body;

    console.log("Received registration data:", req.body);

    // Check if any fields are missing
    if (
      [fullName, email, username, password, phoneNumber].some(
        (field) => field?.trim() === ""
      )
    ) {
      console.error("Validation failed: Missing fields");
      throw new ApiError(400, "All fields are compulsory");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      console.error("Conflict: User already exists", existedUser);
      throw new ApiError(409, "User with email or username already exists");
    }

    // Handle file uploads for avatar and cover image
    console.log("Files received:", req.files);
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
      console.error("Validation failed: Avatar file is required");
      throw new ApiError(400, "Avatar file is required");
    }

    console.log("Uploading avatar...");
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      console.error("Avatar upload failed");
      throw new ApiError(400, "Failed to upload avatar");
    }

    console.log("Creating user...");
    // Create a new user
    const user = await User.create({
      fullName,
      avatar: avatar.url,

      email,
      password,
      phoneNumber,
      username: username.toLowerCase(),
    });

    console.log("Fetching created user without sensitive fields...");
    // Get the created user without password and refresh token fields
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      console.error("Error while fetching created user");
      throw new ApiError(500, "Something went wrong while registering a user");
    }

    console.log("User registered successfully:", createdUser);

    // Return response
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "Registered successfully"));
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error; // Re-throw to be handled by asyncHandler
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshtoken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true, // Set to true for production (HTTPS)
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)

    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingrefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingrefreshToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refreshToken");
    }
    if (incomingrefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or match");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshtoken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "refresh token is make"
        )
      );
  } catch (error) {
    throw new ApiError(error?.message, "this is the error");
  }
});

export { registerUser, loginUser, refreshAccessToken };
