import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { News } from "../models/news.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addNews = async (req, res) => {
  try {
    const { title, content, author, category, tags, paragraphContent } =
      req.body;

    if (!title || !content || !author) {
      throw new ApiError(400, "Title, content, and author are required");
    }

    // Upload independent images to Cloudinary
    const uploadedImages = [];
    if (req.files && req.files.images) {
      for (let i = 0; i < req.files.images.length; i++) {
        const file = req.files.images[i].path; // Access file.path directly
        const uploadedImage = await uploadOnCloudinary(file);

        if (!uploadedImage) {
          throw new ApiError(500, "Error uploading image");
        }
        uploadedImages.push(uploadedImage.secure_url); // Save Cloudinary image URL
      }
    }

    // Upload paragraph images to Cloudinary
    const paragraphsImages = [];
    if (req.files && req.files.paragraphImages) {
      for (let i = 0; i < req.files.paragraphImages.length; i++) {
        const file = req.files.paragraphImages[i].path; // Access file.path directly
        const uploadedImage = await uploadOnCloudinary(file);

        if (!uploadedImage) {
          throw new ApiError(500, "Error uploading paragraph image");
        }
        paragraphsImages.push(uploadedImage.secure_url); // Save Cloudinary image URL
      }
    }

    // Create a new news article
    const news = await News.create({
      title,
      content,
      author,
      category,
      tags: Array.isArray(tags) ? tags : [], // Split tags if provided as a comma-separated string
      images: uploadedImages,
      paragraphContent: Array.isArray(paragraphContent) ? paragraphContent : [], // Split paragraph content if provided as a comma-separated string
      paragraphImages: paragraphsImages,
      owner: req.user._id, // Associate the article with the logged-in user
    });

    // Send a success response
    res
      .status(201)
      .json(new ApiResponse(201, "News article added successfully", news));
  } catch (error) {
    console.error(error); // Log error for debugging
    throw new ApiError(500, "Unable to add news article");
  }
};

export const getNews = asyncHandler(async (req, res) => {
  try {
    const news = await News.find();
    res
      .status(200)
      .json(new ApiResponse(200, news, "News retrieved successfully"));
  } catch (error) {
    console.error(error);
    res.status(500).json(new ApiResponse(500, "Unable to retrieve news"));
  }
});
