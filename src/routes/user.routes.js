import { Router } from "express";
import { registerUser, loginUser, logOutUser,refreshAccessToken } from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register",registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT,logOutUser);
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);

export default router;
