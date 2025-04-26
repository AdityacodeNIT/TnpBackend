import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { News } from "../models/news.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addNews = async (req, res) => {
  try {
    const { title, content, author, category, tags, paragraphContent } = req.body;

    console.log("Request Body:", req.body);

    // Validate required fields
    //
    if (!title || !content || !author) {
      console.error("Missing required fields: title, content, or author");
      return res.status(400).json({ message: "Title, content, and author are required" });
    }

    // Upload independent images to Cloudinary
    const uploadedImages = [];
    if (req.files && req.files.images) {
      for (let i = 0; i < req.files.images.length; i++) {
        const file = req.files.images[i];
        try {
          const uploadedImage = await uploadOnCloudinary(file.path);
          if (!uploadedImage) {
            throw new Error(`Error uploading image: ${file.originalname}`);
          }
          uploadedImages.push(uploadedImage.secure_url); // Save Cloudinary image URL
        } catch (error) {
          console.error(`Error uploading image ${file.originalname}:`, error);
          return res.status(500).json({ message: `Error uploading image: ${file.originalname}`, details: error.message });
        }
      }
    }

    // Upload paragraph images to Cloudinary
    const paragraphsImages = [];
    if (req.files && req.files.paragraphImages) {
      for (let i = 0; i < req.files.paragraphImages.length; i++) {
        const file = req.files.paragraphImages[i];
        try {
          const uploadedImage = await uploadOnCloudinary(file.path);
          if (!uploadedImage) {
            throw new Error(`Error uploading paragraph image: ${file.originalname}`);
          }
          paragraphsImages.push(uploadedImage.secure_url); // Save Cloudinary image URL
        } catch (error) {
          console.error(`Error uploading paragraph image ${file.originalname}:`, error);
          return res.status(500).json({ message: `Error uploading paragraph image: ${file.originalname}`, details: error.message });
        }
      }
    }

    const news = await News.create({
      title,
      content,
      author,
      category,
      tags: Array.isArray(tags) ? tags : [], // Split tags if provided as a comma-separated string
      images: uploadedImages,  // Corrected: Use the uploaded images array directly
      paragraphContent: Array.isArray(paragraphContent) ? paragraphContent : [], // Corrected: Split paragraph content if provided
      paragraphImages: paragraphsImages,
      owner: req.user._id, // Associate the article with the logged-in user
    });

    // Send a success response
    console.log("News article added successfully:", news);
    res.status(201).json(new ApiResponse(201, "News article added successfully", news));
  } catch (error) {
    console.error("Error in addNews method:", error); // Log error for debugging
    return res.status(500).json({ message: "Unable to add news article", details: error.message });
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

export const getNewsById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find the news item by its ID
    const newsItem = await News.findById(id);

    // If no news item is found, throw an error
    if (!newsItem) {
      throw new ApiError(404, "News article not found");
    }

    // Return the news item if found
    res
      .status(200)
      .json(
        new ApiResponse(200, newsItem, "News article retrieved successfully")
      );
  } catch (error) {
    console.error(error); // Log error for debugging
    throw new ApiError(500, "Unable to retrieve news article");
  }
});

export const deleteNewsById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const newsItem = await News.findById(id);
  if (!newsItem) {
    throw new ApiError(404, "News article not found");
  }

  await newsItem.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "News article deleted successfully"));
});