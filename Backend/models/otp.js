const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' } // ✅ This OTP will auto-delete after 5 minutes
    }
});

module.exports = mongoose.model('Otp', otpSchema);