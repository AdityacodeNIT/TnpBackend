import { Router } from "express";
import {
  addNews,
  getNews,
  getNewsById,
} from "../controllers/news.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const newsrouter = Router();

// Route to add news
newsrouter.post(
  "/addNews",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "paragraphImages", maxCount: 10 },
  ]),
  verifyJWT,
  addNews
);

// Route to get news
newsrouter.get("/getNews", getNews);

newsrouter.get("/getNews/:id", getNewsById);

export default newsrouter;
