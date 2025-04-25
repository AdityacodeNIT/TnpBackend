import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";

import { upload } from "../middlewares/multer.middleware.js"; // Make sure Multer is set up for multi-file uploads
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js"; // Optional: for admin/auth access

const router = express.Router();

//  Create Event — requires multiple images
router.post(
  "/create",
  verifyJWT,
  upload.array("images", 10), // Allow up to 10 images
  createEvent
);

//  Get All Events
router.get("/get", getAllEvents);

//  Get Event by ID
router.get("/get-ById/:id", getEventById);

//  Update Event — add/remove images
router.put(
  "/update/:id",
  verifyJWT, // Optional: protect route
  isAdmin,
  upload.array("images", 10),
  updateEvent
);

// Delete Event
router.delete("/delete/:id", verifyJWT,isAdmin, deleteEvent);

export default router;
