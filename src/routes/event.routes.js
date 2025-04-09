import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  deleteEvent,
} from "../controllers/event.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


import { verifyJWT , isAdmin } from "../middlewares/auth.middleware.js";

const eventRouter = express.Router();

// POST /api/events - Create a new event
eventRouter.post("/create", upload.single("photo"), createEvent);

// GET /api/events - Get all events
eventRouter.get("/get-events", getAllEvents);

// GET /api/events/:id - Get a specific event by ID
eventRouter.get("/get-eventByID/:id", getEventById);

// DELETE /api/events/:id - Delete a specific event
eventRouter.delete("/delete-event/:id", deleteEvent);

export default eventRouter;
