const express = require('express');
const router = express.Router();
const Otp = require('../models/otp'); // Import the model from Step 2
const transporter = require('../utils/transporter'); // Your transporter from Step 1

router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        
        // 1. Generate the 6-digit code
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Save to MongoDB (This replaces any old OTP for this email)
        await Otp.findOneAndUpdate(
            { email }, 
            { otp: otpCode, createdAt: Date.now() }, 
            { upsert: true, new: true }
        );

        // 3. Define the Email Content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification Code - SS Management',
            html: `
                <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px;">
                    <h2 style="color: #4f46e5;">SS Management Verification</h2>
                    <p>Hello,</p>
                    <p>Your 6-digit verification code is:</p>
                    <h1 style="color: #4f46e5; letter-spacing: 5px;">${otpCode}</h1>
                    <p>This code will expire in 5 minutes.</p>
                </div>
            `
        };

        // 4. Send the Email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "OTP sent successfully to " + email });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send OTP", details: err.message });
    }
});

// verify otp 

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // 1. Find the most recent OTP for this email
        const otpRecord = await Otp.findOne({ email });

        // 2. Check if OTP exists (If not, it expired or was never sent)
        if (!otpRecord) {
            return res.status(400).json({ 
                error: "OTP expired or not found. Please request a new one." 
            });
        }

        // 3. Compare the provided OTP with the stored one
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ 
                error: "Invalid verification code. Please try again." 
            });
        }

        // 4. Success! Delete the OTP so it can't be used again
        await Otp.deleteOne({ _id: otpRecord._id });

        res.status(200).json({ 
            message: "Email verified successfully!",
            success: true 
        });

    } catch (err) {
        console.error("Verification Error:", err);
        res.status(500).json({ error: "Internal server error during verification" });
    }
});



module.exports = router;