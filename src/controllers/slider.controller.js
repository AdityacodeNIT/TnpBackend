import { SliderImage } from "../models/sliderImage.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Upload multiple images
export const uploadSliderImages = asyncHandler(async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    throw new ApiError(400, "No images provided");
  }

  const uploadedImages = [];

  for (const file of files) {
    const result = await uploadOnCloudinary(file.path);
    if (result?.url) {
      const image = await SliderImage.create({
        url: result.url,
        caption: req.body.caption || "",
        uploadedBy: req.user._id,
      });
      uploadedImages.push(image);
    }
  }

  res.status(201).json(
    new ApiResponse(201, uploadedImages, "Images uploaded successfully")
  );
});

// Fetch all slider images
export const getSliderImages = asyncHandler(async (req, res) => {
  const images = await SliderImage.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, images));
});

// Delete a slider image by ID
export const deleteSliderImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const image = await SliderImage.findById(id);
  if (!image) {
    throw new ApiError(404, "Image not found");
  }

  await image.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Slider image deleted successfully"));
});
