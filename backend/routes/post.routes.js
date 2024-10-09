import express from "express"

import { protectedRoute } from "../middlewares/protectedRoute.middleware.js";
import { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } from "../controllers/post.controller.js";

const router = express.Router()

router.get("/all",protectedRoute,getAllPosts)
router.get("/following",protectedRoute,getFollowingPosts)
router.get("/user/:username",protectedRoute,getUserPosts)
router.get("/likes/:id",protectedRoute,getLikedPosts)
router.post("/create",protectedRoute, createPost)
router.post("/like/:id",protectedRoute, likeUnlikePost)
router.post("/comment/:id",protectedRoute, commentOnPost)
router.delete("/:id",protectedRoute, deletePost)

export default router;