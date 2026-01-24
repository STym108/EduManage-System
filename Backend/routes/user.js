const express = require('express');
const router = express.Router();
const User = require('../models/users');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const jwt=require('jsonwebtoken');
require('dotenv').config(); // ✅ ADD THIS BACK

//email:sampleemail@
//password:samplepassword

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,    // If this is undefined, it crashes
    api_secret: process.env.API_SECRET,

});

// Signup Route
router.post('/signup', (req, res) => {
    //  Check if files exist before calling cloudinary
    if (!req.files || !req.files.image) {
        return res.status(400).json({ error: "No image uploaded" });
    }
// 1. Upload Image to Cloudinary
    cloudinary.uploader.upload(req.files.image.tempFilePath, async (err, result) => {
        if (err) {
            console.log("Cloudinary Config Error:", err);
            return res.status(500).json({ error: "Cloudinary upload failed" });
        }
        //below code works only above if(){} fails or no error found in cloudinary image uploading

        //keeping the await part in try block hence following try catch rule  for async await to avoid error 
        try {
            // 2. Check if user already exists

            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(400).json({ error: "Email already registered" });
            }
            //user doesnt found with the same email then proceed further 
            // 3. Hash Password and Save User
            bcrypt.hash(req.body.password, 10, async (hashErr, hash) => {
                if (hashErr) return res.status(500).json({ error: "Hash failed" });

                const newUser = new User({
                    _id: new mongoose.Types.ObjectId(),
                    fullName: req.body.fullName,
                    phone:req.body.phone,
                    email: req.body.email,
                    password: hash,
                    imageUrl: result.secure_url,
                    imageId: result.public_id
                });
               // the emidiate parent or callback of await function must be async 
               //await functions are stored in variables 
                const savedUser = await newUser.save();
                console.log(savedUser)
                res.status(201).json({ newStudent: savedUser });
            });
        } catch (dbError) {
            res.status(500).json({ error: "Server error"});
        }
    });
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        // 1. Find the user by email
        const user = await User.findOne({ email: req.body.email });

        // 2. Check if user exists
        if (!user) {
            return res.status(404).json({ error: "No user found with this email" });
        }

        // 3. Compare passwords
        // We use the 'user' object directly (not an array)
        bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ error: "Password matching failed" });
            }

            // 4. Generate JWT Token
            const token = jwt.sign(
                { 
                    userId: user._id, 
                    email: user.email 
                }, 
                process.env.Secret_key, 
                { expiresIn: '24h' }
            );

            // 5. Send success response with user data and token
            res.status(200).json({
                message: "Login successful",
                token: token,
                user: {
                    fullName: user.fullName,
                    phone:user.phone,
                    email: user.email,
                    imageUrl: user.imageUrl
                }
            });
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;