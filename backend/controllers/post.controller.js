import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

import { v2 as cloudinary } from "cloudinary";

//post handling


//make or create post
export const createPost = async(req,res) => {
    try {
       const { text } = req.body;

       let { img } = req.body;

       const userId = req.user._id.toString()

       const user = await User.findById(userId);

       if(!user){
            return res.status(404).json(
                {
                    message : "User not found"
                }
            )
       }

       if(!text && !img){

            return res.status(400).json(
                {
                    success : false,
                    error : "Post must have text or image"
                }
            )
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post(
            {
                user: userId,
                text,
                img
            }
        )

        await newPost.save();

        res.status(201).json(
            newPost
        )

    } catch (error) {
        console.log(`ERR : error while createPost, ERROR : ${error.message}`)

        return res.status(500).json(
            {
                success : false,
                error : "error while createPost",
                errorMessage : error.message
            }
        )
    }
}

//delete the post
export const deletePost = async(req,res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            res.status(404).json(
                {
                    success : false,
                    error : "Post not found"
                }
            )
        }

        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json(
                {
                    success : false,
                    error : "You are not authorized to delete this post"
                }
            )
        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0]

            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json(
            {
                success : true,
                message : "Post Deleted successfully"
            }
        )
    } catch (error) {
        console.log(`ERR : error while createPost, ERROR : ${error.message}`)

        return res.status(500).json(
            {
                success : false,
                error : "error while createPost",
                errorMessage : error.message
            }
        )
    }
}

//comment on Post
export const commentOnPost = async(req,res) => {
    try {
        
        const { text } = req.body;

        const postId =  req.params.id;

        const userId = req.user._id

        if(!text){

            return res.status(400).json(
                {
                    error : "Text field is required"
                }
            )
        }


        //find the post
        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json(
                {
                    success : false,
                    error : "Post not found"
                }
            )
        }

        //make a comment field.
        const comment = {user : userId, text};

        //push the comment in the post's comments array
        post.comments.push(comment);

        await post.save();

        res.status(200).json(post)


    } catch (error) {
        
        console.log(`ERR : error while comment On Post, ERROR : ${error.message}`)

        return res.status(500).json(
            {
                success : false,
                error : "error commentOnPost",
                errorMessage : error.message
            }
        )
    }
}


//method for the like Unlike post
export const likeUnlikePost = async(req,res) => {

    try {
        
        const userId = req.user._id;

        const postId  = req.params.id;

        const post = await Post.findById(postId);

        if(!post){

            return res.status(404).json(
                {
                    success : false,
                    error : "Post not found"
                }
            )
        }

        const userLikePost = post.likes.includes(userId);


        //check if user already liked the post
        if(userLikePost){
            // if already liked then unlike the post
            post.likes.pull(userId);

            await User.updateOne({_id : userId}, {$pull : {likedPosts : postId}})

            await post.save();

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString())

            res.status(200).json(updatedLikes)

        }else{
            //if not liked 

            post.likes.push(userId);

            await post.save();

            await User.updateOne({_id : userId}, {$push : {likedPosts : postId}})

            const notification = new Notification(
                {
                    from : userId,
                    to : post.user._id,
                    type : "like"
                }
            )

            await notification.save();

            const updatedLikes = post.likes

            res.status(200).json(updatedLikes)

        }

    } catch (error) {

        console.log(`ERR : error while likeUnlikePost, ERROR : ${error.message}`)

        return res.status(500).json(
            {
                success : false,
                error : "error likeUnlikePost",
                errorMessage : error.message
            }
        )
    }
}


//to get all the posts
export const getAllPosts = async(req,res) => {
    try {
        
        const posts = await Post.find().sort({ createdAt : -1}).populate(
            {
                path : "user",
                select : "-password"
            }
        ).populate(
            {
                path : "comments.user",
                select : "-password"
            }
        )

        if(posts.length === 0){
            return res.status(200).json([])
        }

        res.status(200).json(posts)
    } catch (error) {

        console.log(`ERR : error while getAllPosts, ERROR : ${error}`);

        return res.status(500).json(
            {
                success : false,
                error : "internal server error while making getAllPosts",
                errorMessage : error.message
            }
        )
    }
}


//get all liked posts
export const getLikedPosts = async(req,res) => {

    const userId = req.params.id;

    try {
        
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json(
                {
                    error : "User not found"
                }
            )
        }

        const likedPosts = await Post.find({_id : {$in : user.likedPosts}})
        .populate(
            {
                path : "user",
                select : "-password"
            }
        ).populate({
            path : "comments.user",
            select : "-password"
        })

        res.status(200).json(likedPosts)
    } catch (error) {
        console.log(`ERR : error while getLikedPosts, ERROR : ${error}`);

        return res.status(500).json(
            {
                success : false,
                error : "internal server error while making getLikedPosts",
                errorMessage : error.message
            }
        )
    }
}


//get all following posts
export const getFollowingPosts = async(req,res) => {
    try {
        
        const userId = req.user._id;

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json(
                {
                    success : false,
                    error : "User not found"
                }
            )
        }

        const following = user.following;

        const feedPost = await Post.find({user : { $in : following } })
        .sort(
            {
                createdAt : -1
            }
        ).populate(
            {
                path : "user",
                select : "-password"
            }
        ).populate(
            {
                path : "comments.user",
                select : "-password"
            }
        )

        res.status(200).json(feedPost)
    } catch (error) {
        
        console.log(`ERR : error while getFollowingPosts, ERROR : ${error}`);

        return res.status(500).json(
            {
                success : false,
                error : "internal server error while making getFollowingPosts",
                errorMessage : error.message
            }
        )

    }
}

//get userPosts
export const getUserPosts = async(req,res) => {
    try {
        
        const username = req.params.username;

        const user = await User.findOne({username : username})

        if(!user){
            return res.status(404).json(
                {
                    seuccess : false,
                    error : "User not found"
                }
            )
        }

        const posts = await Post.find( { user : user._id } )
        .sort(
            {
                createdAt : -1,
            }
        ).populate(
            {
                path : "user",
                select : "-password"
            }
        ).populate(
            {
                path : "comments.user",
                select : "-password"
            }
        )

        res.status(200).json(posts)


    } catch (error) {
        
        console.log(`ERR : error while getFollowingPosts, ERROR : ${error}`);

        return res.status(500).json(
            {
                success : false,
                error : "internal server error while making getFollowingPosts",
                errorMessage : error.message
            }
        )
    }
}