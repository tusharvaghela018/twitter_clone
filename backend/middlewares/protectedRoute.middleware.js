import User from "../models/user.model.js"
import jwt from "jsonwebtoken"

export const protectedRoute = async(req,res,next) => {
    try {

        //fetch the cookie from the request
        const token = req.cookies.jwt;
        
        //if not token found
        if(!token){
            return res.status(401).json(
                {
                    success : false,
                    error : "Unauthorized : No token provided"
                }
            )
        }

        //if token found then verify

        const decode = jwt.verify(token, process.env.JWT_SECRET)

        if(!decode){
            return res.status(401).json(
                {
                    success : false,
                    error : "Unauthorized : Invalid token"
                }
            )
        }

        const user = await User.findById(decode.userId).select("-password")

        if(!user){
            return res.status(404).json(
                {
                    success : false,
                    error : "user not found"
                }
            )
        }

        req.user = user;

        next();

    } catch (error) {
        console.log(`ERR : error while authenticate user, ERROR : ${error.message}`)
        return res.status(500).json(
            {
                success : false,
                error : "Internal Server Error",
                errorMessage : error.message
            }
        )
    }
}