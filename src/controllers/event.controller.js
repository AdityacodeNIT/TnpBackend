import { Event } from "../models/event.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Create Event
export const createEvent = asyncHandler(async (req, res) => {
  const { title, date, paragraph } = req.body;

  if (!title || !date || !paragraph) {
    throw new ApiError(400, "All fields (title, date, paragraph) are required.");
  }

  const imageLocalPath = req.file?.path;

  if (!imageLocalPath) {
    throw new ApiError(400, "Event image is required.");
  }

  const imageUpload = await uploadOnCloudinary(imageLocalPath);

  if (!imageUpload?.url) {
    throw new ApiError(500, "Image upload failed.");
  }

  const event = await Event.create({
    title,
    date,
    paragraph,
    photo: imageUpload.url,
  });

  res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
});

// Get All Events
export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ createdAt: -1 });
  res
    .status(200)
    .json(new ApiResponse(200, events, "Fetched all events successfully"));
});

// Get Event By ID
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

// Delete Event
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const event = await Event.findByIdAndDelete(id);

  if (!event) {
    throw new ApiError(404, "Event not found or already deleted");
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Event deleted successfully"));
});
