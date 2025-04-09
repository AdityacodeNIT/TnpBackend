import { Router } from "express";
import { verifyJWT, isAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  uploadSliderImages,
  getSliderImages,
  deleteSliderImage,
  
} from "../controllers/slider.controller.js";

const router = Router();

//  Admin-only route to upload multiple slider images
router.post(
  "/upload",
  verifyJWT,
  isAdmin,
  upload.array("sliderImages", 5), // Accepts up to 5 images
  uploadSliderImages
);

//  Public or user-authenticated route (optional)
router.get("/get-images",getSliderImages);

//  Admin-only delete route
router.delete("/delete-images/:id", verifyJWT, isAdmin, deleteSliderImage);



export default router;
