
const nodemailer=require('nodemailer')

//** */ email transporter configuration ,verifies the email of sender ( e.g postoffice )
//email service to send otp or email to user  : nodemailer 

// The transporter is like your virtual post office
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your 16-character App Password
    }
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.log("Transporter Error:", error);
    } else {
        console.log("Server is ready to send emails");
    }
});