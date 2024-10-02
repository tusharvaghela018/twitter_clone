import jwt from "jsonwebtoken"

// const jwt = require("jsonwebtoken")

export const generateTokenandSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn : process.env.EXPIRE_TOKEN
    })

    res.cookie("jwt",token,{
        maxAge : 15*24*60*60*1000, // in mili second
        httpOnly : true, //prevent xss attacks cross-site scripting attacks
        sameSite : "strict", //CSRF attacks cross-site request forgrey attacks
        secure : process.env.NODE_ENV !== "development"
    })
}