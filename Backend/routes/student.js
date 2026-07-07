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

// Add or enroll student
router.post('/add-students', checkAuth, async (req, res) => {
    try {
        const { fullName, phone, email, address, courseId } = req.body;
        const teacherId = req.userData.adminId;

        // 1. Check if student already exists under this teacher by phone or email
        const existingStudent = await Students.findOne({
            teacherId,
            $or: [{ phone }, { email }]
        });

        if (existingStudent) {
            // Check if student is already enrolled in this course
            const alreadyEnrolled = existingStudent.courses && existingStudent.courses.includes(courseId);
            if (alreadyEnrolled) {
                return res.status(400).json({ error: "Student is already enrolled in this course." });
            }

            // Append new course to their enrolled courses array
            if (!existingStudent.courses) {
                existingStudent.courses = [];
            }
            existingStudent.courses.push(courseId);
            
            // Update legacy courseId field for backward compatibility
            existingStudent.courseId = courseId;

            const savedStudent = await existingStudent.save();
            return res.status(200).json({ 
                message: "Existing student enrolled in course successfully",
                newaddedStudent: savedStudent 
            });
        }

        // 2. If student does not exist, upload profile photo and create a new record
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: "Profile image is required for new student registration." });
        }

        // Upload Image to Cloudinary
        cloudinary.uploader.upload(req.files.image.tempFilePath, async (err, result) => {
            if (err) {
                console.log("Cloudinary Config Error:", err);
                return res.status(500).json({ error: "Cloudinary upload failed" });
            }

            try {
                const newstudent = new Students({
                    _id: new mongoose.Types.ObjectId(),
                    fullName,
                    phone,
                    address,
                    email,
                    imageUrl: result.secure_url,
                    imageId: result.public_id,
                    teacherId,
                    courses: [courseId],
                    courseId // legacy backward compatibility
                });

                const savedStudent = await newstudent.save();
                res.status(201).json({ newaddedStudent: savedStudent });
            } catch (dbError) {
                console.log("Mongoose Save Error:", dbError.message);
                res.status(500).json({ 
                    error: "Database saving failed", 
                    details: dbError.message 
                });
            }
        });

    } catch (err) {
        console.error("Add Student Error:", err.message);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
})

//get all student of a course added by a  teacher 

// get all student created by logged-in teacher with live balances
router.get('/all', checkAuth, async (req, res) => {
    try {
        const teacherId = req.userData.adminId;
        const allstudents = await Students.find({ teacherId }).populate('courses');

        // Fetch all fees to calculate outstanding dues per student
        const Fees = require('../models/fees');
        const allFees = await Fees.find({ creatorId: teacherId });

        // Map phone number to sum of paid fees
        const paymentMap = {};
        allFees.forEach(fee => {
            if (fee.phone) {
                paymentMap[fee.phone] = (paymentMap[fee.phone] || 0) + (fee.amount || 0);
            }
        });

        // Compute balances for each student
        const studentsWithBalances = await Promise.all(allstudents.map(async (st) => {
            const studentObj = st.toObject();
            
            // Handle legacy course fallback
            if (studentObj.courseId && (!studentObj.courses || studentObj.courses.length === 0)) {
                const legacyCourse = await Course.findById(studentObj.courseId);
                if (legacyCourse) {
                    studentObj.courses = [legacyCourse];
                }
            }

            const totalPaid = paymentMap[studentObj.phone] || 0;
            const totalCourseCost = studentObj.courses ? studentObj.courses.reduce((sum, c) => sum + (c.price || 0), 0) : 0;
            const outstandingDue = Math.max(0, totalCourseCost - totalPaid);

            studentObj.totalPaid = totalPaid;
            studentObj.outstandingDue = outstandingDue;
            return studentObj;
        }));
        
        res.status(200).json({
            count: studentsWithBalances.length,
            students: studentsWithBalances
        });
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({
            error: "Could not fetch students list",
            details: err.message
        });
    }
});

//get all student of a course added by a teacher
router.get('/get-allStudents/:id', checkAuth, async (req, res) => {
    try {
        const thecourse = await Course.findById(req.params.id);
        if (!thecourse) return res.status(404).json({ error: "Course not found" });
        if (thecourse.creatorId != req.userData.adminId) {
            return res.status(403).json({ error: "Unauthorized: You are not the creator of this course" });
        }

        // Find students that have this courseId in either legacy or normalized array
        const findstudents = await Students.find({
            $or: [
                { courseId: thecourse._id },
                { courses: thecourse._id }
            ]
        });
        console.log("found all the students of this course ");
        res.status(200).json(findstudents);
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
});
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
        if (existingstudent.teacherId != req.userData.adminId) {
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
     const lateststudents = await Students.find({ teacherId: req.userData.adminId })
         .populate('courses')
         .sort({ _id: -1 }) 
         .limit(5);
 
     // Handle legacy fallback for backward compatibility
     const processedStudents = await Promise.all(lateststudents.map(async (st) => {
         const studentObj = st.toObject();
         if (studentObj.courseId && (!studentObj.courses || studentObj.courses.length === 0)) {
             const legacyCourse = await Course.findById(studentObj.courseId);
             if (legacyCourse) {
                 studentObj.courses = [legacyCourse];
             }
         }
         return studentObj;
     }));

     res.status(200).json({
         count: processedStudents.length,
         students: processedStudents
     });
    } catch (err) {
     console.error("Fetch Error:", err.message);
     res.status(500).json({
         error: "Could not fetch latest students",
         details: err.message
     });
    }
 });

// Get single student details with populated course info
router.get('/view-student/:id',checkAuth,async (req,res)=>{
    try{
    const data=await Students.findById(req.params.id).populate('courses');
    if (!data) {
        return res.status(404).json({ error: "Student not found" });
    }

    const studentObj = data.toObject();
    // Handle legacy fallback for backward compatibility
    if (studentObj.courseId && (!studentObj.courses || studentObj.courses.length === 0)) {
        const legacyCourse = await Course.findById(studentObj.courseId);
        if (legacyCourse) {
            studentObj.courses = [legacyCourse];
        }
    }

    res.status(200).json({details: studentObj});
    }catch(err){
        console.error("Fetch Error:", err.message);
        res.status(500).json({
            error: "Could not fetch details of the  student",
            details: err.message
        });
    }
})

module.exports=router