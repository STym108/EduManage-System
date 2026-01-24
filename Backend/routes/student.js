const express=require('express')
const checkAuth=require('../middleware/checkAuth')
const cloudinary = require('cloudinary').v2;
require('dotenv').config(); 
const Students =require('../models/students')
const mongoose = require('mongoose');
const Course =require('../models/courses')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,    // If this is undefined, it crashes
    api_secret: process.env.API_SECRET,

});
const router=express.Router()

//add new student
router.post('/add-students',checkAuth,(req,res)=>{
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
            //keeping the await part in try block hence following try catch rule  for async await to avoid asynchronous error 
            try {
                 // 3. Create new student object
    
                    const newstudent = new Students({
                        _id:new mongoose.Types.ObjectId(),//missed 'new' last time while making the id of the new course 
                        fullName:req.body.fullName,
                        phone:req.body.phone,
                        address:req.body.address,
                        email:req.body.email,
                        imageUrl: result.secure_url,
                        imageId: result.public_id,
                        teacherId:req.userData.userId,
                        courseId:req.body.courseId
                    });
                   //  4. Save to Database
    
                    const savedStudent = await newstudent.save();
                    res.status(201).json({ newaddedStudent: savedStudent });
            
            } catch (dbError) {
                console.log("Mongoose Save Error:", dbError.message);
                //  Detailed error message for Postman debugging
                res.status(500).json({ 
                    error: "Database saving failed", 
                    details: dbError.message 
                });
            }
        });
})

//get all student of a course added by a  teacher 

router.get('/get-allStudents/:id',checkAuth,async (req,res)=>{
       
    try{
       const thecourse =await Course.findById(req.params.id)


       if(thecourse.creatorId!=req.userData.userId) return res.status(500).send("you are not the creator of this course")

        const findstudents=await Students.find({courseId:thecourse._id})
        console.log("found all the students of this course ")
        res.status(200).send(findstudents)
    }
    catch(err){
        return res.status(500).json({
            'error':err.message
        })
    }
})
//delete student api (only the teacher who added the student  can remove/delete )

router.delete('/delete-student/:id',checkAuth,async (req,res)=>{
    try {
        const thestudent = await Students.findById(req.params.id);

        //1. F Check if course exists at all
        if (!thestudent) {
            return res.status(404).json({ error: "Course not found or already deleted" });
        }

        //2.  Check permissions
        if (thestudent.teacherId!= req.userData.userId) {
            return res.status(403).json({ error: "Only the creator can delete this course" });
        }

        // 3. Delete from MongoDB
        await Students.findByIdAndDelete(req.params.id);

        // 4. Delete from Cloudinary (using await to ensure it happens)
        await cloudinary.uploader.destroy(thestudent.imageId);

        console.log("Deleted Student successfully from DB and Cloudinary");
        res.status(200).json({ message: "Course deleted successfully" });

    } catch (err) {
        return res.status(500).json({
            error_detail: err.message
        });
    }
});

//update student , only teacher or creator can update it 

router.put('/update-student/:id',checkAuth,async (req,res)=>{
    try {

        // 1. Find the existing course
        const existingstudent = await Students.findById(req.params.id);

        if (!existingstudent) {
            return res.status(404).json({ error: "student not found" });
        }

        // 2. Permission Check
        if (existingstudent.teacherId != req.userData.userId) {
            return res.status(403).json({ error: "Unauthorized: Only the creator can update this student" });
        }

        // 3. Prepare data for update (spread existing data as default)
        const updatedData = {
            fullName: req.body.fullName || existingstudent.fullName,
            email: req.body.email || existingstudent.email,
            phone:req.body.phone||existingstudent.phone,
            address:req.body.address||existingstudent.address,
            imageUrl: existingstudent.imageUrl,
            imageId: existingstudent.imageId
        };

        // 4. Handle Image Update Logic
        if (req.files && req.files.image) {
            // Delete old image from Cloudinary
            await cloudinary.uploader.destroy(existingstudent.imageId);

            // Upload new image
            const result = await cloudinary.uploader.upload(req.files.image.tempFilePath);
            
            // Set new image details
            updatedData.imageUrl = result.secure_url;
            updatedData.imageId = result.public_id;
        }

        // 5. Save everything to Database
        // { new: true } returns the updated document instead of the old one
        const finalUpdatedstudent = await Students.findByIdAndUpdate(
            req.params.id, 
            { $set: updatedData }, 
            { new:true }
        );
        res.status(200).json({
            message: "Student updated successfully",
            updatedstudent: finalUpdatedstudent
        });
        
    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: "Update failed", details: err.message });
    }
});

// get latest 5 students
router.get('/latest-students', checkAuth, async (req, res) => {
    try { 
     // 1. Filter by the logged-in user's ID
     // 2. Sort by _id descending (-1) to get the newest first
     // 3. Limit to 5 results
     const lateststudents = await Students.find({ teacherId: req.userData.userId })
         .sort({ _id: -1 }) 
         .limit(5);
 
     res.status(200).json({
         count: lateststudents.length,
         students: lateststudents
     });
    } catch (err) {
     // ✅ FIX 2: Handle errors so the server doesn't hang
     console.error("Fetch Error:", err.message);
     res.status(500).json({
         error: "Could not fetch latest students",
         details: err.message
     });
    }
 });

// 
router.get('/view-student/:id',checkAuth,async (req,res)=>{
    try{
    const data=await Students.findById(req.params.id);
    res.status(200).json({details: data});
    }catch(err){
        console.error("Fetch Error:", err.message);
        res.status(500).json({
            error: "Could not fetch details of the  student",
            details: err.message
        });
    }
})

module.exports=router