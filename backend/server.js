import dotenv from "dotenv";
dotenv.config();

import express from "express";
import  router from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import { connectMongoDB } from "./db/connectMongoDB.js";

const app = express();

//middlewares
app.use(express.json()); // to parse the req.body
app.use(express.urlencoded({extended : true})); // to parse the form data
app.use(cookieParser()); //parse the cookie

app.use("/api/auth", router);

app.listen(process.env.PORT,()=>{

    console.log(`server is running on http://localhost:${process.env.PORT}`);
    

    //mongoDB connection
    connectMongoDB();
})