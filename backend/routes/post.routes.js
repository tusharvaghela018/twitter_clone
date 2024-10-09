import express from "express"

import { protectedRoute } from "../middlewares/protectedRoute.middleware.js";
import { createPost, deletePost, commentOnPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUserPosts } from "../controllers/post.controller.js";

const router = express.Router()

//get all post
router.get("/all",protectedRoute,getAllPosts)
//get all posts of following
router.get("/following",protectedRoute,getFollowingPosts)
//get user posts
router.get("/user/:username",protectedRoute,getUserPosts)
//get liked posts
router.get("/likes/:id",protectedRoute,getLikedPosts)
//create post
router.post("/create",protectedRoute, createPost)
//like or unlike the posts
router.post("/like/:id",protectedRoute, likeUnlikePost)
//do comment on the post
router.post("/comment/:id",protectedRoute, commentOnPost)
//delete the post
router.delete("/:id",protectedRoute, deletePost)

export default router;