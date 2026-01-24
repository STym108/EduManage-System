const express=require('express')
const router=express.Router()
const checkAuth=require('../middleware/checkAuth')
const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // ✅ ADD THIS BACK
const Course =require('../models/courses')
const mongoose = require('mongoose');
const Students=require('../models/students')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,    // If this is undefined, it crashes
    api_secret: process.env.API_SECRET,

});

//add new course route
router.post('/add-course',checkAuth,(req,res)=>{
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
        //keeping the await part in try block hence following try catch rule  for async await to avoid error 
        try {
             // 3. Create new course object

                const newcourse = new Course({
                    _id:new mongoose.Types.ObjectId(),//missed 'new' last time while making the id of the new course 
                    courseName:req.body.courseName,
                    price:req.body.price,
                    startingDate:req.body.startingDate,
                    description: req.body.description,
                    endDate:req.body.endDate,
                    imageUrl: result.secure_url,
                    imageId: result.public_id,
                    creatorId:req.userData.userId
                });
               //  4. Save to Database

                const savedcourse = await newcourse.save();
                res.status(201).json({ newaddedcourse: savedcourse });
        
        } catch (dbError) {
            console.log("Mongoose Save Error:", dbError.message);
            // ✅ Detailed error message for Postman debugging
            res.status(500).json({ 
                error: "Database saving failed", 
                details: dbError.message 
            });
        }
    });
})


//get all courses of currently logged in teacher

router.get('/all-courses',checkAuth,async (req,res)=>{
try{
    const findcourses=await Course.find({creatorId:req.userData.userId})
    console.log("found all the courses of this teacher ")
//i changed this response from just findcourses naked array to an object where i can send as many data along with the array i want 
res.status(200).json({
    courses: findcourses,
    totalCourses: findcourses.length
});

}
catch(err){
    return res.status(500).json({
        'error':err.message
    })
}
})
//get a course by its id **** and then give all the students of the course by calling all stdns of course route

router.get('/course-detail/:id',checkAuth,async (req,res)=>{
    try{

        const findcourse=await Course.findById(req.params.id)
        const allstudents=await Students.find({courseId:req.params.id})
        console.log(" the course whose id is given  ")
        res.status(200).json({
            course:findcourse,
            students:allstudents
        })

    }
    catch(err){
        return res.status(500).json({
            'error':err.message
        })

    }
    })

//deleta a course by its id and make sure only the creator can delete it 

router.delete('/delete-course/:id', checkAuth, async (req, res) => {
    try {
        const thecourse = await Course.findById(req.params.id);

        //1. F Check if course exists at all
        if (!thecourse) {
            return res.status(404).json({ error: "Course not found or already deleted" });
        }

        //2.  Check permissions
        if (thecourse.creatorId != req.userData.userId) {
            return res.status(403).json({ error: "Only the creator can delete this course" });
        }

        // 3. Delete from MongoDB
        await Course.findByIdAndDelete(req.params.id);

        // 4. Delete from Cloudinary (using await to ensure it happens)
        await cloudinary.uploader.destroy(thecourse.imageId);

        console.log("Deleted course successfully from DB and Cloudinary");
        res.status(200).json({ message: "Course deleted successfully" });

    } catch (err) {
        return res.status(500).json({
            error_detail: err.message
        });
    }
});

//*********update course details 
router.put('/update-course/:id', checkAuth, async (req, res) => {
    try {
        // 1. Find the existing course
        const existingCourse = await Course.findById(req.params.id);

        if (!existingCourse) {
            return res.status(404).json({ error: "Course not found" });
        }

        // 2. Permission Check
        if (existingCourse.creatorId != req.userData.userId) {
            return res.status(403).json({ error: "Unauthorized: Only the creator can update this course" });
        }

        // 3. Prepare data for update (spread existing data as default)
        const updatedData = {
            courseName: req.body.courseName || existingCourse.courseName,
            price: req.body.price || existingCourse.price,
            description: req.body.description || existingCourse.description,
            startingDate: req.body.startingDate || existingCourse.startingDate,
            endDate: req.body.endDate || existingCourse.endDate,
            imageUrl: existingCourse.imageUrl,
            imageId: existingCourse.imageId
        };

        // 4. Handle Image Update Logic
        if (req.files && req.files.image) {
            // Delete old image from Cloudinary
            await cloudinary.uploader.destroy(existingCourse.imageId);

            // Upload new image
            const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
            
            // Set new image details
            updatedData.imageUrl = result.secure_url;
            updatedData.imageId = result.public_id;
        }

        // 5. Save everything to Database
        // { new: true } returns the updated document instead of the old one
        const finalUpdatedCourse = await Course.findByIdAndUpdate(
            req.params.id, 
            { $set: updatedData }, 
            { new: true }
        );

        res.status(200).json({
            message: "Course updated successfully",
            updatedCourse: finalUpdatedCourse
        });

    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: "Update failed", details: err.message });
    }
});

// get latest 5 course
router.get('/latest-courses', checkAuth, async (req, res) => {
    try { 
     // 1. Filter by the logged-in user's ID
     // 2. Sort by _id descending (-1) to get the newest first
     // 3. Limit to 5 results
     const latestcourses = await Course.find({ creatorId: req.userData.userId })
         .sort({ _id: -1 }) 
         .limit(5);
 
     res.status(200).json({
         count: latestcourses.length,
         courses: latestcourses
     });
       
    } catch (err) {
     // ✅ FIX 2: Handle errors so the server doesn't hang
     console.error("Fetch Error:", err.message);
     res.status(500).json({
         error: "Could not fetch latest courses",
         details: err.message
     });
    }
 });



module.exports=router
