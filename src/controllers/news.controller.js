import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { News } from "../models/news.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Admin: Add a news item
export const addNews = asyncHandler(async (req, res) => {
  const { title, link, category } = req.body;

  if (!title || !link) {
    throw new ApiError(400, "Title and link are required");
  }

  const news = await News.create({
    title,
    link,
    category,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, news, "News article added successfully"));
});

// Get all news
export const getNews = asyncHandler(async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 }); // Newest first
  res
    .status(200)
    .json(new ApiResponse(200, news, "News retrieved successfully"));
});

// Admin: Delete news
export const deleteNewsById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const newsItem = await News.findById(id);
  if (!newsItem) {
    throw new ApiError(404, "News article not found");
  }

  await newsItem.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "News article deleted successfully"));
});
