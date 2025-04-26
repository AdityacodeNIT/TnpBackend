import { Router } from "express";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";
import {
  addNews,
  getNews,
  deleteNewsById,
} from "../controllers/news.controller.js";

const router = Router();

// Public: Get all news
router.get("/get-news", getNews);

// Admin: Add news
router.post("/add-news", verifyJWT, isAdmin, addNews);

// Admin: Delete news
router.delete("/delete-news/:id", verifyJWT, isAdmin, deleteNewsById);

export default router;
