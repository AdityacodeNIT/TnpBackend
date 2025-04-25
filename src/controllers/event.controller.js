import { Event } from "../models/event.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

//  Create Event with multiple images
export const createEvent = asyncHandler(async (req, res) => {
  const { title, date, paragraph } = req.body;
  console.log(req.body)

  if (!title || !date || !paragraph) {
    throw new ApiError(400, "All fields  are required.");
  }

  const imagePaths = req.files?.map(file => file.path);

  if (!imagePaths || imagePaths.length === 0) {
    throw new ApiError(400, "At least one image is required.");
  }

  const uploadResults = await Promise.all(
    imagePaths.map(path => uploadOnCloudinary(path))
  );

  const imageUrls = uploadResults.map(upload => upload.url).filter(Boolean);

  if (imageUrls.length === 0) {
    throw new ApiError(500, "Image upload failed.");
  }

  const event = await Event.create({
    title,
    date,
    paragraph,
    photos: imageUrls,
  });

  res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
});

//  Get All Events
export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });

  if (!events || events.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No events found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, events, "Fetched all events successfully"));
});


//  Get Event By ID
export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, event, "Fetched event successfully"));
});

//  Update Event with partial image add/remove
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, date, paragraph, removeImages } = req.body;

  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  let removeImagesArray = [];
  if (removeImages) {
    removeImagesArray = Array.isArray(removeImages)
      ? removeImages
      : [removeImages];
  }

  //  Remove selected images from DB + Cloudinary
  if (removeImagesArray.length > 0) {
    for (const imageUrl of removeImagesArray) {
      await deleteFromCloudinary(imageUrl);
    }

    event.photos = event.photos.filter(
      (url) => !removeImagesArray.includes(url)
    );
  }

  //  Upload new images
  if (req.files && req.files.length > 0) {
    const uploads = await Promise.all(
      req.files.map((file) => uploadOnCloudinary(file.path))
    );

    const newImageUrls = uploads.map((upload) => upload.url).filter(Boolean);
    event.photos.push(...newImageUrls);
  }

  //  Update other fields
  if (title) event.title = title;
  if (date) event.date = date;
  if (paragraph) event.paragraph = paragraph;

  await event.save();

  res.status(200).json(new ApiResponse(200, event, "Event updated successfully"));
});

//  Delete Event + Cloudinary images
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    throw new ApiError(404, "Event not found or already deleted");
  }

  //  Clean Cloudinary images
  if (event.photos && event.photos.length > 0) {
    for (const url of event.photos) {
      await deleteFromCloudinary(url);
    }
  }

  await event.deleteOne();

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Event and images deleted successfully"));
});
