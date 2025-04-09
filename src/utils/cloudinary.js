import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload Image
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath); // Remove local file
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

//  Delete Image from Cloudinary using URL
const deleteFromCloudinary = async (imageUrl) => {
  try {
    const publicId = extractPublicId(imageUrl);
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
  }
};

//  Extract public_id from full image URL
const extractPublicId = (url) => {
  try {
    const parts = url.split("/");
    const file = parts.pop(); // image.jpg
    const folder = parts.pop(); // e.g. event folder name
    const publicId = `${folder}/${file.split(".")[0]}`; // folder/image
    return publicId;
  } catch {
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
