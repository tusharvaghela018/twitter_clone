import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username : {
       type : String,
       required : true,
       unique : true,
    },
    fullname : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true,
        minlength : 6
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    followers : [
        {
            type : mongoose.Types.ObjectId,
            ref : "User",
            default : []
        }
    ],
    following : [
        {
            type : mongoose.Types.ObjectId,
            ref : "User",
            default : []
        }
    ],
    profileImg : {
        type : String,
        default : ""
    },
    coverImg : {
        type : String,
        default : ""
    },
    bio : {
        type : String,
        default : ""
    },
    link : {
        type : String,
        default : ""
    }
}, 
//use for : member since july 2021, like createdAt
{timestamps : true})

const User = mongoose.model("user", userSchema)

export default User