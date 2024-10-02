import express from "express";
import { followUnfollowUser, getSuggestedUser, getUserProfile, updateUser } from "../controllers/user.controller.js";
import { protectedRoute } from "../middlewares/protectedRoute.middleware.js";

const router = express.Router();

router.get("/profile/:username", protectedRoute, getUserProfile)
router.get("/suggested", protectedRoute, getSuggestedUser)
router.post("/follow/:id", protectedRoute, followUnfollowUser)
router.post("/update", protectedRoute, updateUser)

export default router;