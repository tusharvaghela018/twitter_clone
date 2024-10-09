import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import express from "express";
import {v2 as cloudinary} from "cloudinary"

import  authRouter from "./routes/auth.routes.js";
import  userRouter from "./routes/user.routes.js";
import  postRouter from "./routes/post.routes.js"
import  noticationRouter from "./routes/notification.routes.js"

import { connectMongoDB } from "./db/connectMongoDB.js";

dotenv.config();

cloudinary.config(
    {
        cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
        api_key : process.env.CLOUDINARY_API_KEY,
        api_secret : process.env.CLOUDINARY_API_SECRET
    }
)

const app = express();

//middlewares
app.use(express.json()); // to parse the req.body
app.use(express.urlencoded({extended : true})); // to parse the form data
app.use(cookieParser()); //parse the cookie


//routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts",postRouter)
app.use("/api/notifications", noticationRouter)

app.listen(process.env.PORT,()=>{

    console.log(`server is running on http://localhost:${process.env.PORT}`);
    

    //mongoDB connection
    connectMongoDB();
})