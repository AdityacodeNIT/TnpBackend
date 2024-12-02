import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create Car
const createCar = asyncHandler(async (req, res) => {
  const { title, description, manufacturer, model, tags } = req.body;

  // Check for required fields
  if (!title || !description || !manufacturer || !model) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if car already exists
  const existedCar = await Product.findOne({
    title,
    manufacturer,
  });

  if (existedCar) {
    throw new ApiError(409, "Car already exists");
  }

  // Handle multiple image uploads
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "At least one car image is required");
  }

  // Upload images to Cloudinary
  const uploadedImages = [];
  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i].path; // Access file.path directly
    const uploadedImage = await uploadOnCloudinary(file);
    if (!uploadedImage) {
      throw new ApiError(500, "Error uploading car image");
    }
    uploadedImages.push(uploadedImage.url);
  }

  // Save the car details to the database
  const product = await Product.create({
    title,
    description,
    manufacturer,
    model,
    tags: JSON.parse(tags), // Parse tags if sent as a JSON string
    images: uploadedImages,
    owner: req.user._id, // Store image URLs
  });

  res.status(201).json(new ApiResponse(201, product, "Car added successfully"));
});

// Search Cars
const searchresult = asyncHandler(async (req, res) => {
  const { keyword } = req.query; // Capture the search term from query parameters

  // Ensure that the keyword is a string and create a regular expression from it
  const regex = new RegExp(keyword, "i"); // 'i' makes the regex case-insensitive

  try {
    const result = await Product.aggregate([
      {
        $match: {
          $or: [
            {
              title: {
                $regex: regex, // Apply the regex to the title field
              },
            },
            {
              tags: {
                $in: [regex], // Check if any tag matches the regex
              },
            },
          ],
        },
      },
    ]);

    return res.json({ result });
  } catch (error) {
    console.error("Error fetching search results:", error);
    return res.status(500).json({ message: "Error fetching search results" });
  }
});

// Get Single Car Details
const getCarDetails = asyncHandler(async (req, res) => {
  try {
    const car = await Product.findOne({
      _id: req.params.productId,
      user: req.user._id, // Ensure the car belongs to the logged-in user
    });

    if (!car) {
      throw new ApiError(404, "Car not found");
    }

    res.status(200).json(car);
  } catch (err) {
    throw new ApiError(500, "Failed to retrieve car", err);
  }
});

// Update Car Details
const updateCarDetails = asyncHandler(async (req, res) => {
  const { carId } = req.params;
  const updateFields = req.body;

  console.log("Request received to update car details");
  console.log("Car ID from URL:", carId);
  console.log("Request body (update fields):", updateFields);
  console.log("Logged-in user ID:", req.user._id);

  try {
    // Check if the car exists and belongs to the logged-in user
    const car = await Product.findOne({ _id: carId, owner: req.user._id });
    if (!car) {
      console.log("Car not found or user is not authorized to update it");
      throw new ApiError(
        404,
        "Car not found or you're not authorized to update it"
      );
    }

    console.log("Car found:", car);
    console.log("Current car details:", {
      title: car.title,
      description: car.description,
      manufacturer: car.manufacturer,
      model: car.model,
      tags: car.tags,
      images: car.images,
    });

    // Handle image uploads if new images are provided
    if (req.files && req.files.length > 0) {
      console.log("New images detected. Uploading images...");
      const uploadedImages = [];
      for (const file of req.files) {
        console.log(`Uploading image: ${file.path}`);
        const carImage = await uploadOnCloudinary(file.path);
        if (!carImage) {
          console.log("Error uploading image:", file.path);
          throw new ApiError(500, "Image upload failed");
        }
        console.log("Image uploaded successfully:", carImage.url);
        uploadedImages.push(carImage.url);
      }
      updateFields.images = uploadedImages;
    }

    console.log("Updated fields to be saved:", updateFields);

    // Update the car details in the database
    const updatedCar = await Product.findOneAndUpdate(
      { _id: carId, owner: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedCar) {
      console.log("Car update failed. Car not found or unauthorized.");
      throw new ApiError(
        404,
        "Car not found or you're not authorized to update it"
      );
    }

    console.log("Car updated successfully:", updatedCar);

    // Send response with updated car details
    res.status(200).json(updatedCar);
  } catch (err) {
    console.error("Error updating car details:", err);
    throw new ApiError(500, "Failed to update car details", err);
  }
});

// Get User Cars
const getUserCars = asyncHandler(async (req, res) => {
  try {
    console.log("Fetching cars for user ID:", req.user._id);

    const userCars = await Product.find({ owner: req.user?._id });

    if (userCars.length === 0) {
      throw new ApiError(404, "No cars found for this user");
    }

    res.status(200).json(userCars);
  } catch (err) {
    console.error("Error fetching user's cars:", err);
    throw new ApiError(500, "Failed to fetch user's cars", err);
  }
});

// Delete Car
const deleteCar = asyncHandler(async (req, res) => {
  const { carId } = req.params;

  try {
    const deletedCar = await Product.findOneAndDelete({
      _id: carId,
      owner: req.user._id, // Ensure the car belongs to the logged-in user
    });

    if (!deletedCar) {
      throw new ApiError(
        404,
        "Car not found or you're not authorized to delete it"
      );
    }

    res.status(200).json({ message: "Car deleted successfully" });
  } catch (err) {
    console.error("Error deleting car:", err);
    throw new ApiError(500, "Failed to delete car", err);
  }
});

export {
  searchresult,
  getCarDetails,
  updateCarDetails,
  deleteCar,
  createCar,
  getUserCars,
};
