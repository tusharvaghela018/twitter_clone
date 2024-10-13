import bcrypt from "bcryptjs"
import User from "../models/user.model.js";
import { generateTokenandSetCookie } from "../lib/utils/generateToken.js";

//signup controller
export const signup = async(req,res) => {
    try {

        //take the all values from the user
        const {email, username, fullname, password} = req.body

        //validating email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        //check the given email format is correct or not
        if(!emailRegex.test(email)){
            return res.status(400).json({
                success : false,
                error : "Invalid email format"
            })
        }

        //check if the user is already exist or not !
        const existingUser = await User.findOne({username : username})

        if(existingUser){
            return res.status(400).json({
                success : false,
                error : "username is already taken"
            })
        }

        //check for the existing email
        const existingEmail = await User.findOne({email : email})

        if(existingEmail){
            return res.status(400).json({
                success : false,
                error : "Email is already exist"
            })
        }


        //check if the password length is MinLength is 6 or not
        if(password.length < 6){
            return res.status(400).json(
                {
                    success : false,
                    error : "Password length must be 6 letters"
                }
            )
        }


        //hash the password before save the data to the dataBase
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)

        //set all the data for the new user
        const newUser = new User({
            fullname : fullname,
            username : username,
            email : email,
            password : hashedPassword
        })

            // Save the user first
            await newUser.save();

            // If newUser is created successfully, then generate the token and set the cookie
            generateTokenandSetCookie(newUser._id, res);

            res.status(201).json({
                success : true,
                _id : newUser._id,
                fullname : newUser.fullname,
                username : newUser.username,
                email : newUser.email,
                followers : newUser.followers,
                following : newUser.following,
                profileImg : newUser.profileImg,
                coverImg : newUser.coverImg
            })
        
    } catch (error) {
        
        console.log(`ERR : error while signup , ERROR : ${error.message}`)

        res.status(500).json(
            {
                success : false,
                error : "Internal server error : Signup Controller",
                errorMessage : error.message
            }
        )
    }
};

//login controller
export const login = async(req,res) => {
    try {
        
        const { username, password } = req.body

        const user = await User.findOne({username})

        if(!user){
            return res.status(400).json(
                {
                    success : false,
                    error : "username or password is incorrect"
                }
            )
        }

        const IspasswordCorrect = await bcrypt.compare(password, user?.password || "");

        // First, check if the password is correct before generating the token
        if (!IspasswordCorrect) {
            return res.status(400).json({
                success: false,
                error: "Credentials are not matched"
            });
        }

        // After successful password check, generate the token
        generateTokenandSetCookie(user._id, res);

        res.status(200).json(
            {
                success : true,
                message : "Logged in successfully",
                user : {
                    _id : user._id,
                    username : user.username,
                    fullname : user.fullname,
                    email : user.email,
                    followers : user.followers,
                    following : user.following,
                    profileImg : user.profileImg,
                    coverImg : user.coverImg,
                    bio : user.bio,
                    link : user.link
                }
            }
        )
    } catch (error) {
        console.log(`ERR : error while login, ERROR : ${error.message}`)

        res.status(500).json({
            success : false,
            error : "Internal server error : Login Controller",
            errorMessage : error.message
        })
    }
};

//logout controller
export const logout = async(req,res) => {
    try {
        res.cookie("jwt","",{maxAge : 0})

        res.status(200).json(
            {
                success : true,
                message : "logged out successfully"
            }
        )
    } catch (error) {
        console.log(`ERR : error while logging out, ERROR : ${error.message}`)

        res.status(500).json(
            {
                success : false,
                message : "Error while logging out",
                errorMessage : error.message
            }
        )
    }
};

//for the check if user is authenticated or not
export const getMe = async(req,res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
    
        res.status(200).json(user)
    } catch (error) {
        console.log(`ERR : error in getMe controller, ERROR : ${error.message}`)
        return res.status(500).json(
            {
                success : false,
                error : "error while authenticate user",
                errorMessage : error.message
            }
        )
    }
}

// export const getData = async(req,res) =>{
//     try {
//         const allData = await User.find().select("-password");

//         res.status(200).json(allData)
//     } catch (error) {
//         console.log("ERROR : erro rin getData", error.message);
//     }
// }