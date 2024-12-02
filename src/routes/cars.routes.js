import { Router } from "express";
import {
  searchresult,
  getCarDetails,
  updateCarDetails,
  deleteCar,
  createCar,
  getUserCars,
} from "../controllers/car.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const carRouter = Router();

carRouter
  .route("/createcar")
  .post(upload.array("images", 10), verifyJWT, createCar);

carRouter.route("/search").post(verifyJWT, searchresult);

carRouter.route("/:productId").get(verifyJWT, getCarDetails);

carRouter.route("/:carId").put(verifyJWT, updateCarDetails);

carRouter.route("/getCar").post(verifyJWT, getUserCars);

carRouter.route("/:carId").delete(verifyJWT, deleteCar);

export default carRouter;
