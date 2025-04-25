import { Router } from "express";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";
import {
  addNews,
  getNews,
  deleteNewsById,
  getNewsById
} from "../controllers/news.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.get("/get-news", getNews);

// 🔒 Admin can create news
router.post(
  "/add-news",
  verifyJWT,
  isAdmin,
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "paragraphImages", maxCount: 10 },
  ]),
  addNews
);

// 🔒 Admin can delete news
router.delete("/delete-news/:id", verifyJWT, isAdmin, deleteNewsById);

router.get("/getNews/:id",getNewsById);

export default router;
