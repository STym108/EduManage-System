const express=require('express')
const checkAuth = require('../middleware/checkAuth')
const router=express.Router()
const fees =require('../models/fees')
const mongoose = require('mongoose');

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
            creatorId: req.userData.userId,
            date: new Date() // Records exactly when the admin entered this
        });

        const savedFee = await newFeeEntry.save();
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
            creatorId: req.userData.userId, // Security: Only see your own data
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
        const allpayments=await fees.find({creatorId:req.userData.userId,courseId:req.query.courseId,phone:req.query.phone})

        res.status(200).json({payments :allpayments})
    }catch(err){
    return res.status(500).json({"error detail :":err.message})
    }
})

router.put('/update-fee/:feeId', checkAuth, async (req, res) => {
    try {
        const feeId = req.params.feeId;
        const { amount, remark, createdAt } = req.body; //Accept createdAt
        // 1. Validation: Ensure amount is valid
        if (amount !== undefined && amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than zero" });
        }

        // 2. Find and Update
        // We ensure creatorId matches to prevent unauthorized edits
        const updatedFee = await fees.findOneAndUpdate(
            { _id: feeId, creatorId: req.userData.userId },
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
        const transactions = await fees.find({ creatorId: req.userData.userId })
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

        // Ensure the record exists and belongs to the logged-in teacher
        const deletedFee = await fees.findOneAndDelete({
            _id: feeId,
            creatorId: req.userData.userId
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