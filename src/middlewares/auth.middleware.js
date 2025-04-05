import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "").trim();

  if (!token) throw new ApiError(401, "Access Token not provided");

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decoded._id).select("-password -refreshToken");
  if (!user) throw new ApiError(401, "Invalid Token: User not found");

  req.user = user;
  next();
});

export const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    throw new ApiError(403, "Access Denied: Admins only");
  }
  next();
});
