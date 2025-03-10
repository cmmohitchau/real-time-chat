import express from "express";
import { Request , Response } from "express";
import { genSaltSync, hashSync , compareSync} from "bcrypt-ts";
import { generateToken } from "../lib/utils.js";
import User from "../models/userModel.js";
import { CustomRequest } from "../middleware/authMiddleware.js";
import cloudinary from "../lib/cloudinary.js";
import { userLogin, userSignup } from "../lib/userValidation.js";


export const Signup = async (req : Request , res : Response) : Promise<any> => {
    
    try {
        const {email , fullName , password} = req.body;
        const valid = userSignup.safeParse(req.body);
        
        if(!valid.success) {
            return res.status(401).json({ message : "Input is invalid"});
        }
        
        if(!email || !fullName || !password) {
            return res.status(400).json({message : "All fields are required"});
        }

        if(password.length < 6) {
            return res.status(400).json({message : "Password must be atleast 6 characters"});
        }

        const existingUser = await User.findOne({email});
        if(existingUser)return res.status(400).json({ message : "Email already exists"});

        const salt = genSaltSync(10);
        const hashedPassword = hashSync(password , salt);
        const newUser = new User({
            email ,
            fullName ,
            password : hashedPassword
        });

        

        if(newUser) {
            const token = generateToken(JSON.stringify(newUser._id), res);
            await newUser.save();
            
            return res.status(200).json({
                _id : newUser._id,
                fullName : newUser.fullName,
                email : newUser.email,
            });

        } 
            return res.status(400).json({message : "Invalid user data"});
        

    } catch (e) {
        return res.status(511).json({
            message : "Internal Server Error"
        });

    }
};

export const Signin = async (req : Request, res : Response) : Promise<any> => {
    const {email , password} = req.body;
    try {
        const isValid = userLogin.safeParse(req.body);
        if(!isValid) {
            return res.status(401).json({ message : "Input invalid"});
        }
        const user = await User.findOne({email});

        if(!user)return res.status(400).json({message : "Invalid email or password"});

        const isValidPassword = compareSync(password , user.password);

        if(!isValidPassword)return res.status(400).json({message : "Invalid email or password"});

       const token =  generateToken(JSON.stringify(user._id) , res);

        return res.status(200).json({
            _id : user._id,
            fullName : user.fullName,
            email : user.email,
        });

    } catch(e) {
        console.log("Error in login controller");
        res.status(500).json({ message : "Internal Server Error"});

        
    }
};


export const Logout = async (req : Request, res : Response) => {
    
    try {
        res.cookie("jwt" , "" , {maxAge : 0});
        res.status(200).json({message : "Logged out successfully"});
    } catch(e) {
        console.log("Error in logout controller");
        res.status(500).json({ message : "Internal Server Error"});        
    }
}

export const updateProfile = async (req : CustomRequest, res : Response) : Promise<any> => {

    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic) {
            return res.status(400).json( { message : "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updateUser = await User.findByIdAndUpdate(userId , {profilePic : uploadResponse.secure_url} , {new : true});

        res.status(200).json(updateUser);

    } catch (e) {
        console.log("Error in updateProfile controller");
        res.status(500).json({ message : "Internal Server Error"});
    }
};

export const checkAuth = (req : CustomRequest, res : Response) => {
    try {
        res.status(200).json(req.user);
    } catch (e) {
        console.log("Error in checkAuth controller");
        res.status(500).json({ message : "Internal Server Error"});
    }
}