import { Router } from "express";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";
import {
  addNews,
  getNews,
  deleteNewsById,
  getNewsById
} from "../controllers/news.controller.js";

const router = Router();

// Public: Get all news
router.get("/get-news", getNews);


router.post(
  "/add-news",
  verifyJWT,
 
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "paragraphImages", maxCount: 10 },
  ]),
  addNews
);


// Admin: Delete news
router.delete("/delete-news/:id", verifyJWT, isAdmin, deleteNewsById);

router.get("/getNews/:id",getNewsById);

export default router;
