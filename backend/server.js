import dotenv from "dotenv";
dotenv.config();

import express from "express";
import  router from "./routes/auth.routes.js";
import { connectMongoDB } from "./db/connectMongoDB.js";

const app = express();

app.use("/api/auth", router);

app.listen(process.env.PORT,()=>{

    console.log(`server is running on http://localhost:${process.env.PORT}`);
    

    //mongoDB connection
    connectMongoDB();
})