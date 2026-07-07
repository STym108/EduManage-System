const express = require('express');
const router = express.Router();
const User = require('../models/users.js');
const Otp = require('../models/otp.js'); // Import OTP model for signup verification
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const jwt=require('jsonwebtoken');
const checkAuth = require('../middleware/checkAuth');
require('dotenv').config(); // ✅ ADD THIS BACK

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,    // If this is undefined, it crashes
    api_secret: process.env.API_SECRET,

});

// Signup Route with OTP Verification
router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, phone, password, otp } = req.body;

        // 1. Verify OTP first before doing heavy tasks (like uploading files)
        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ error: "Verification code expired or not found. Please request a new one." });
        }
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ error: "Invalid verification code. Please try again." });
        }

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // 3. Check if files exist
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        // 4. Upload Image to Cloudinary
        cloudinary.uploader.upload(req.files.image.tempFilePath, async (err, result) => {
            if (err) {
                console.log("Cloudinary Config Error:", err);
                return res.status(500).json({ error: "Cloudinary upload failed" });
            }

            try {
                // Delete the verified OTP record so it cannot be reused
                await Otp.deleteOne({ _id: otpRecord._id });

                // 5. Hash Password and Save User
                bcrypt.hash(password, 10, async (hashErr, hash) => {
                    if (hashErr) return res.status(500).json({ error: "Hash failed" });

                    const newUser = new User({
                        _id: new mongoose.Types.ObjectId(),
                        fullName,
                        phone,
                        email,
                        password: hash,
                        imageUrl: result.secure_url,
                        imageId: result.public_id
                    });

                    const savedUser = await newUser.save();
                    console.log("Registered new user:", savedUser.email);
                    res.status(201).json({ newStudent: savedUser });
                });
            } catch (dbError) {
                console.error("Signup save database error:", dbError.message);
                res.status(500).json({ error: "Database saving failed", details: dbError.message });
            }
        });
    } catch (err) {
        console.error("Signup error:", err.message);
        res.status(500).json({ error: "Internal server error during registration", details: err.message });
    }
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
                    email: user.email,
                    role: user.role || 'admin',
                    adminId: user.role === 'staff' ? user.adminId : user._id
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
                    phone: user.phone,
                    email: user.email,
                    imageUrl: user.imageUrl,
                    role: user.role || 'admin',
                    adminId: user.role === 'staff' ? user.adminId : user._id
                }
            });
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});






// Reset Password Route
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // 1. Verify OTP first
        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ error: "Verification code expired or not found. Please request a new one." });
        }
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ error: "Invalid verification code. Please try again." });
        }

        // 2. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "No user found with this email address" });
        }

        // 3. Hash the new password
        bcrypt.hash(newPassword, 10, async (hashErr, hash) => {
            if (hashErr) return res.status(500).json({ error: "Password encryption failed" });

            // 4. Update password
            user.password = hash;
            await user.save();

            // 5. Delete OTP record
            await Otp.deleteOne({ _id: otpRecord._id });

            console.log("Password reset successful for:", email);
            res.status(200).json({ message: "Password has been reset successfully. You can now login." });
        });
    } catch (err) {
        console.error("Reset Password Route Error:", err.message);
        res.status(500).json({ error: "Internal server error during password reset", details: err.message });
    }
});

// Update Profile Route
router.put('/update-profile', checkAuth, async (req, res) => {
    try {
        const { fullName, phone } = req.body;
        const userId = req.userData.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.fullName = fullName || user.fullName;
        user.phone = phone || user.phone;

        // If a new image logo is uploaded
        if (req.files && req.files.image) {
            // Upload new image to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(req.files.image.tempFilePath, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            // Delete old image from Cloudinary to prevent storage leak
            if (user.imageId) {
                await new Promise((resolve) => {
                    cloudinary.uploader.destroy(user.imageId, (err, result) => {
                        resolve(result);
                    });
                });
            }

            user.imageUrl = uploadResult.secure_url;
            user.imageId = uploadResult.public_id;
        }

        const updatedUser = await user.save();
        
        console.log("Profile updated successfully for:", updatedUser.email);
        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                fullName: updatedUser.fullName,
                phone: updatedUser.phone,
                email: updatedUser.email,
                imageUrl: updatedUser.imageUrl
            }
        });

    } catch (err) {
        console.error("Profile update error:", err.message);
        res.status(500).json({ error: "Internal server error during profile update", details: err.message });
    }
});

// Admin-only Staff Registration
router.post('/register-staff', checkAuth, async (req, res) => {
    try {
        const { fullName, phone, email, password } = req.body;
        
        // Safety: only admins can create staff members
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ error: "Access Denied: Only Admins can register staff accounts" });
        }

        // Check if user already exists
        const User = require('../models/users');
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        // Hash the staff password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle optional staff profile image upload, otherwise default to a clean initials avatar
        let imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=4f46e5&color=fff`;
        let imageId = 'default_avatar';

        if (req.files && req.files.image) {
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload(req.files.image.tempFilePath, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            imageUrl = uploadResult.secure_url;
            imageId = uploadResult.public_id;
        }

        const newStaff = new User({
            _id: new mongoose.Types.ObjectId(),
            fullName,
            phone,
            email,
            password: hashedPassword,
            imageUrl,
            imageId,
            role: 'staff',
            adminId: req.userData.userId // Linked to this admin's workspace ID
        });

        await newStaff.save();
        res.status(201).json({ message: "Staff account created successfully", staff: { fullName, email } });

    } catch (err) {
        console.error("Staff Registration Error:", err.message);
        res.status(500).json({ error: "Could not register staff member", details: err.message });
    }
});

// Admin-only Get All Staff Members
router.get('/staff', checkAuth, async (req, res) => {
    try {
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ error: "Access Denied: Admin privileges required" });
        }

        const User = require('../models/users');
        const staffList = await User.find({ role: 'staff', adminId: req.userData.userId }).select('-password');
        
        res.status(200).json({ staff: staffList });
    } catch (err) {
        console.error("Fetch Staff Error:", err.message);
        res.status(500).json({ error: "Could not fetch staff accounts", details: err.message });
    }
});

// Admin-only Delete Staff Member
router.delete('/staff/:id', checkAuth, async (req, res) => {
    try {
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ error: "Access Denied: Admin privileges required" });
        }

        const User = require('../models/users');
        const deletedStaff = await User.findOneAndDelete({ 
            _id: req.params.id, 
            role: 'staff', 
            adminId: req.userData.userId 
        });

        if (!deletedStaff) {
            return res.status(404).json({ error: "Staff member not found or unauthorized" });
        }

        res.status(200).json({ message: "Staff member account deleted successfully" });
    } catch (err) {
        console.error("Delete Staff Error:", err.message);
        res.status(500).json({ error: "Could not delete staff account", details: err.message });
    }
});

module.exports = router;