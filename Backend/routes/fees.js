const express=require('express')
const checkAuth = require('../middleware/checkAuth')
const router=express.Router()
const fees =require('../models/fees')
const mongoose = require('mongoose');
const Students = require('../models/students');
const Course = require('../models/courses');
const User = require('../models/users');
const transporter = require('../utils/transporter');

//new fees 
router.post('/add-fees', checkAuth, async (req, res) => {
    try {
        const { fullName, courseId, amount, phone, remark } = req.body;

        // 1. Basic Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Please enter a valid amount" });
        }

        // 2. Create the Fee Record
        // Note: We use courseId + phone to ensure this money is credited to the right person
        const newFeeEntry = new fees({
            _id: new mongoose.Types.ObjectId(),
            fullName,
            courseId,
            amount: Number(amount),
            phone,
            remark: remark || "No remark provided",
            creatorId: req.userData.adminId,
            date: new Date() // Records exactly when the admin entered this
        });

        const savedFee = await newFeeEntry.save();

        // Asynchronously dispatch the email receipt to the student in the background
        (async () => {
            try {
                // 1. Fetch student details to get the registered email address
                const student = await Students.findOne({ phone, teacherId: req.userData.adminId });
                if (!student || !student.email) {
                    console.log(`[INFO] No student record or email found for phone: ${phone}. Skipping receipt email.`);
                    return;
                }

                // 2. Fetch course details to include the name of the subject
                const course = await Course.findById(courseId);
                const courseName = course ? course.courseName : "Enrolled Subject/Course";

                // 3. Fetch teacher profile to get the Institute/Teacher name
                const teacher = await User.findById(req.userData.adminId);
                const instituteName = teacher ? teacher.fullName : "SS Management";

                // 4. Construct styled HTML receipt template
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: student.email,
                    subject: `Tuition Fee Receipt - ${courseName} - ${instituteName}`,
                    html: `
                        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; color: #1f2937;">
                            <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <div style="text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                                    <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${instituteName}</h2>
                                    <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Official Tuition Fee Receipt</p>
                                </div>

                                <!-- Greeting -->
                                <p style="font-size: 16px; margin-top: 0;">Dear <strong>${fullName}</strong>,</p>
                                <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">Thank you for your payment. Here is the confirmation receipt for your tuition fee payment.</p>

                                <!-- Details Table -->
                                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                        <tr>
                                            <td style="padding: 8px 0; color: #6b7280;">Receipt ID:</td>
                                            <td style="padding: 8px 0; font-weight: 600; text-align: right;">#${savedFee._id.toString().substring(18).toUpperCase()}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #6b7280;">Subject/Course:</td>
                                            <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #4f46e5;">${courseName}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #6b7280;">Payment Date:</td>
                                            <td style="padding: 8px 0; font-weight: 600; text-align: right;">${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; color: #6b7280;">Payment Method / Remark:</td>
                                            <td style="padding: 8px 0; font-weight: 600; text-align: right; text-transform: capitalize;">${savedFee.remark}</td>
                                        </tr>
                                        <tr style="border-top: 1px solid #e5e7eb;">
                                            <td style="padding: 15px 0 0 0; font-size: 16px; font-weight: 700; color: #111827;">Amount Paid:</td>
                                            <td style="padding: 15px 0 0 0; font-size: 20px; font-weight: 800; color: #10b981; text-align: right;">₹${amount}</td>
                                        </tr>
                                    </table>
                                </div>

                                <!-- Footer -->
                                <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                                    <p style="margin: 0;">This is an electronically generated receipt. No signature is required.</p>
                                    <p style="margin: 5px 0 0 0;">If you have any questions, please contact the administration at <strong>${instituteName}</strong>.</p>
                                </div>
                            </div>
                        </div>
                    `
                };

                // Dispatch email
                try {
                    await transporter.sendMail(mailOptions);
                    console.log(`[SUCCESS] Fee receipt email sent successfully to ${student.email}`);
                } catch (mailErr) {
                    console.warn(`[WARNING] SMTP receipt dispatch failed: "${mailErr.message}". falling back to logging locally.`);
                    console.log(`\n===============================================\n[DEV RECEIPT LOG] For ${student.email}\nInstitute: ${instituteName}\nCourse: ${courseName}\nAmount: ₹${amount}\n===============================================\n`);
                }
            } catch (innerErr) {
                console.error("[ERROR] Failed to compile receipt content:", innerErr.message);
            }
        })();

        res.status(201).json({ 
            message: "Fee recorded successfully", 
            feeDetail: savedFee 
        });

    } catch (dbError) {
        res.status(500).json({ error: "Failed to record fee", details: dbError.message });
    }
});
    //get all fees paid by all students in all courses to a particular admin/accountant

// GET: /fee/payment-history?courseId=123&phone=9876543210
router.get('/payment-history', checkAuth, async (req, res) => {
    try {
        const { courseId, phone } = req.query;

        // Validation: Ensure parameters are present
        if (!courseId || !phone) {
            return res.status(400).json({ error: "courseId and phone are required" });
        }

        // Find all fee records matching this student in THIS specific course
        const history = await fees.find({
            creatorId: req.userData.adminId, // Security: Scope to institute admin
            courseId: courseId,
            phone: phone
        }).sort({ createdAt: -1 }); // Show latest payments first

        // Calculate Total Paid so far (Useful for the UI)
        const totalPaid = history.reduce((sum, record) => sum + record.amount, 0);

        res.status(200).json({
            payments: history,
            totalPaid: totalPaid
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//get payment history of a student in a particular course to a particular teacher using phoneNo,courseId,creatorId

router.get('/all-payment',checkAuth,async (req,res)=>{
    try{
        const allpayments=await fees.find({creatorId:req.userData.adminId,courseId:req.query.courseId,phone:req.query.phone})

        res.status(200).json({payments :allpayments})
    }catch(err){
    return res.status(500).json({"error detail :":err.message})
    }
})

router.put('/update-fee/:feeId', checkAuth, async (req, res) => {
    try {
        const feeId = req.params.feeId;
        const { amount, remark, createdAt } = req.body; //Accept createdAt

        // Safety: only admins can update fees
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ error: "Access Denied: Only Admins can edit fee records" });
        }

        // 1. Validation: Ensure amount is valid
        if (amount !== undefined && amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than zero" });
        }

        // 2. Find and Update
        // We ensure creatorId matches to prevent unauthorized edits
        const updatedFee = await fees.findOneAndUpdate(
            { _id: feeId, creatorId: req.userData.adminId },
            { 
                $set: { 
                    amount: Number(amount), 
                    remark: remark 
                } 
            },
            { new: true } // Returns the updated document
        );

        if (!updatedFee) {
            return res.status(404).json({ error: "Fee record not found or unauthorized" });
        }

        res.status(200).json({
            message: "Fee record updated successfully",
            updatedFee: updatedFee
        });

    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET: Fetch top 10 recent transactions for the logged-in admin
router.get('/recent-transactions', checkAuth, async (req, res) => {
    try {
        // 1. Find fees created by the logged-in user
        // 2. Sort by newest first (using createdAt or _id)
        // 3. Limit to top 10
        const transactions = await fees.find({ creatorId: req.userData.adminId })
            .sort({ createdAt: -1 }) 
            .limit(10);

        res.status(200).json({
            transactions: transactions
        });
    } catch (err) {
        console.error("History Fetch Error:", err.message);
        res.status(500).json({
            error: "Internal server error while fetching history"
        });
    }
});

// DELETE: Remove a specific fee entry
router.delete('/delete-fee/:feeId', checkAuth, async (req, res) => {
    try {
        const feeId = req.params.feeId;

        // Safety: only admins can delete fees
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ error: "Access Denied: Only Admins can delete fee records" });
        }

        // Ensure the record exists and belongs to the logged-in teacher
        const deletedFee = await fees.findOneAndDelete({
            _id: feeId,
            creatorId: req.userData.adminId
        });

        if (!deletedFee) {
            return res.status(404).json({ error: "Fee record not found or unauthorized" });
        }

        res.status(200).json({ message: "Fee entry removed successfully" });
    } catch (err) {
        console.error("Delete Error:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});
module.exports=router