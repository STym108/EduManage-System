const jwt = require('jsonwebtoken');
require('dotenv').config(); 

// ✅  Added 'next' to the parameters
module.exports = (req, res, next) => {
    try {
        // Check if Authorization header exists to avoid split error
        if (!req.headers.authorization) {
            return res.status(401).json({ msg: "No token provided" });
        }

        const token = req.headers.authorization.split(" ")[1];

        const verify = jwt.verify(token, process.env.Secret_key);
        
        console.log("jwt verified successfully");
        console.log(verify);

        //  Attach the user data to the request object 
        // This allows your routes to know who is logged in (req.userData)
        req.userData = verify;

        next(); // Now this will work correctly
    }
    catch(err) {
        // ✅ FIX 3: Use err.message so Postman shows a real error string
        return res.status(500).json({
            msg: "Authentication failed",
            error: err.message 
        });
    }
}