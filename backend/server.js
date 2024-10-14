import dotenv from "dotenv";
import path from "path"
import cookieParser from "cookie-parser";
import express from "express";
import {v2 as cloudinary} from "cloudinary"

import  authRouter from "./routes/auth.routes.js";
import  userRouter from "./routes/user.routes.js";
import  postRouter from "./routes/post.routes.js"
import  notificationRouter from "./routes/notification.routes.js"

import { connectMongoDB } from "./db/connectMongoDB.js";

dotenv.config();

cloudinary.config(
    {
        cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
        api_key : process.env.CLOUDINARY_API_KEY,
        api_secret : process.env.CLOUDINARY_API_SECRET
    }
)

const PORT = process.env.PORT || 5000
const app = express();
// const __dirname = path.resolve()

//middlewares
app.use(express.json({limit : "1mb"})); // to parse the req.body
app.use(express.urlencoded({extended : true})); // to parse the form data
app.use(cookieParser()); //parse the cookie


//routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts",postRouter)
app.use("/api/notifications", notificationRouter)

// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static(path.join(__dirname, "/frontend/dist")));

// 	app.get("*", (req, res) => {
// 		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
// 	});
// }

app.listen(PORT,()=>{

    console.log(`server is running on http://localhost:${process.env.PORT}`);
    

    //mongoDB connection
    connectMongoDB();
})