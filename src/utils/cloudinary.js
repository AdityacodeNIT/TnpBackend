import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("File path is required.");
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect file type
    });

    // Log response if needed
    console.log("Cloudinary upload response:", response);

    // Delete the locally saved file asynchronously
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error("Error deleting temporary file:", err);
      }
    });

    return response; // Return the Cloudinary response with URL and details
  } catch (error) {
    // Handle errors by logging and throwing custom error
    console.error("Cloudinary upload error:", error.message);

    // Clean up local file if upload fails
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.error("Error deleting temporary file:", err);
      }
    });

    throw new Error("File upload to Cloudinary failed.");
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error("Public ID is required.");
    }

    const response = await cloudinary.uploader.destroy(publicId);

    // Return deletion result
    return response;
  } catch (error) {
    console.error("Cloudinary deletion error:", error.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
