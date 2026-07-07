// ============================================================================
// Core Express Application Configuration
// ============================================================================
// Configures middlewares, database connections, CORS origins, and system routes.

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const fileUpload = require('express-fileupload');

// Route Handlers
const userroute = require('./routes/user');
const studentroute = require('./routes/student');
const feesroute = require('./routes/fees');
const courseroute = require('./routes/courses');
const statsroute = require('./routes/statsroute');
const verifyotp = require('./routes/otprouter');
const cors = require('cors');

// CORS Configuration: Dynamic origin list supporting multiple local dev ports.
// Necessary because Vite starts on 5174 if 5173 is occupied.
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
    origin: (origin, callback) => {
        // Allow curl/mobile requests (no origin header) or listed origins
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Allow transfer of cookies/headers
}));

require('dotenv').config();

// Request body-parsing middlewares
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.json()); // JSON parsing middleware

// Database Connection: Connecting mongoose to MongoDB Atlas
mongoose.connect(`${process.env.mongostring}`)
.then(() => {
    console.log('[SUCCESS] Database connected:', mongoose.connection.name);
})
.catch(err => {
    console.log('[ERROR] Database connection failed:', err.message);
});

// File upload middleware using express-fileupload
// Temporarily stores client-uploaded images before sending them to Cloudinary.
app.use(fileUpload({
    useTempFiles : true,
}));

// Route Middlewares Registration
app.use('/stats', statsroute);      // Analytical summary statistics
app.use('/user', userroute);        // User registration/login & profile
app.use('/course', courseroute);    // Course details and actions
app.use('/fees', feesroute);        // Fee payment collection & receipts
app.use('/student', studentroute);  // Student directory management
app.use('/verify', verifyotp);      // OTP registration check

module.exports = app;