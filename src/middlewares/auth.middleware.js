import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
//hello

const getTokenFromRequest = (req) => {
  return req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();
};

export const verifyJWT = asyncHandler(async (req, _, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
      throw new ApiError(401, "Token is missing");
  }

  try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded._id).select("-password -refreshToken");

      if (!user) {
          throw new ApiError(401, "Invalid token");
      }

      req.user = user;
      next();
  } catch (error) {
      console.error("JWT verification error:", error.message);
      throw new ApiError(401, "Invalid or expired token");
  }
});

export const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    throw new ApiError(403, "Access Denied: Admins only");
  }
  next();
});
