import bcrypt from "bcryptjs"
import {v2 as cloudinary} from "cloudinary"

import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";


//controller for the get the user profile
export const getUserProfile = async(req,res) => {

    const username = req.params.username;

    try {
        
        const user = await User.findOne({username : username}).select("-password");

        if(!user){
            return res.status(404).json(
                {
                    success : false,
                    message : "User not found"
                }
            )
        }

        res.status(200).json(user);
    } catch (error) {
        console.log(`ERR : error while getUserProfile, ERROR : ${error.message}`)

        res.status(500).json(
            {
                success : false,
                error : "Internal Server Error : getUserProfile",
                errorMessage : error.message
            }
        )
    }
}


//controller for the follow and unfollow
export const followUnfollowUser = async(req,res) => {
    try {
        const { id } = req.params;

        const userToModify = await User.findById(id)

        const currentUser = await User.findById(req.user._id)


        //request user id and whom to follow that id is same or not !
        if(id === req.user._id.toString()){
            return res.status(400).json(
                {
                    success : false,
                    error : "You cant follow or unfollow your self"
                }
            )
        }

        //check if the the cuurentUser or the userToModify is exist or not
        if(!userToModify || !currentUser){
            return res.status(404).json(
                {
                    success : false,
                    error : "User not found"
                }
            )
        }

        const isFollowing = currentUser.following.includes(id)


        //if currentUser already follow the userToModify then unfollow
        if(isFollowing){
            //unfollow the user
            await User.findByIdAndUpdate(id, {$pull:{followers : req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$pull :{following : id}})
            res.status(200).json(
                {
                    success : true,
                    message : "User unfollowed successfully."
                }
            )
        }
        else{
            //follow the user
            await User.findByIdAndUpdate(id, {$push : {followers : req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$push : {following : id}})

            //send the notification

            const newNotification = new Notification(
                {
                    type : "follow",
                    from : req.user._id,
                    to : userToModify._id
                }
            )

            await newNotification.save()

            //TODO return the id of the user as a response

            res.status(200).json(
                {
                    success : true,
                    message : "User followed successfully."
                }
            )
        }
    } catch (error) {
        console.log(`ERR : error while followUnfollowUser, ERROR : ${error.message}`)

        res.status(500).json(
            {
                success : false,
                error : "error while followUnfollowUser :  followUnfollowUser : user.controller",
                errorMessage : error.message
            }
        )
    }
}

//for the get suggested user

export const getSuggestedUser = async(req,res)=>{
    try {

        const userId = req.user._id

        const userFolloweedByMe = await User.findById(userId).select("following")

        const users = await User.aggregate(
            [
                {
                    $match :{
                        _id : {$ne : userId}
                    }
                },
                {
                    $sample : {size : 10}
                }
            ]
        )

        const filteredUser = users.filter(user => !userFolloweedByMe.following.includes(user._id))

        const suggestedUsers = filteredUser.slice(0,4)

        suggestedUsers.forEach(user => user.password = null)

        res.status(200).json(suggestedUsers)
        
    } catch (error) {
        console.log(`ERR : error while getSuggestedUser, ERROR : ${error.message}`);

        return res.status(500).json(
            {
                success : false,
                error : "error while getSuggestedUser",
                errorMessage : error.message
            }
        )
        
    }
}

//update the user profile
export const updateUser = async (req,res) => {
    
    //take the which one is going to update
    const {fullname, email, username, currentPassword, newPassword, bio, link} = req.body
    
    //take profileImg and coverImg
    let {profileImg, coverImg} = req.body
    
    //find the userId
    const userId = req.user._id

    try {

        let user = await User.findById(userId)

        if(!user){
            return res.status(404).json(
                {
                    success : false,
                    error : "User not found"
                }
            )
        }


        //make check both fields newPassword and currentPassword are required
        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json(
                {
                     success : false,
                     error : "Please provide current password and new password both"
                }
            )
        }

        //handle password update
        //if the both field are there , then make check for the both are same or not
        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)

            if(!isMatch){
                return res.status(400).json(
                    {
                        success : false,
                        error : "current password is incorrect"
                    }
                )
            }

            if(newPassword.length < 6){
                return res.status(400).json(
                    {
                        success : false,
                        error : "Password must be at least 6 character long"
                    }
                )
            }

            const salt = await bcrypt.genSalt(10)

            user.password = await bcrypt.hash(newPassword, salt)

            //save the user with updated password
            await user.save();
        }

        //update the profile picture
        if(profileImg){

            //make checck for is user has already profile picture
            if(user.profileImg){

                //if already have, then destry first one from the cloudinary
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg)

            profileImg = uploadedResponse.secure_url
        }
        
        //update the cover image
        if(coverImg){

            if(user.coverImg){

                //if already have, then destry first one from the cloudinary
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
            }

            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
    
            coverImg = uploadedResponse.secure_url
        }

        //Update user fields using findByIdAndUpdate

        user = await User.findByIdAndUpdate(
            userId,
            {
                fullname : fullname || user.fullname,

                email : email || user.email,

                username : username || user.username,

                bio : bio || user.bio,

                link : link || user.link,

                profileImg : profileImg || user.profileImg,

                coverImg : coverImg || user.coverImg
            },
            {new : true} // to ensure that updated document is returned
        )


        //password should be null in rge response
        user.password = null

        return res.status(200).json(user)
        
    } catch (error) {
        console.log(`ERR : error while updateUser , ERROR : ${error.message}`)

        return res.status(500).json(
            {
                success : false,
                error : "error while updateUser",
                errorMessage : error.message
            }
        )
    }
}