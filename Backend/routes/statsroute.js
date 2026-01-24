const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/courses');   // Adjust paths to your models
const Student = require('../models/students');
const Fees = require('../models/fees');
const checkAuth = require('../middleware/checkAuth');

router.get('/', checkAuth, async (req, res) => {
    try {
        const teacherId = req.userData.userId;

        // Execute all queries in parallel for better performance
        const [
            totalCourses,
            totalStudents,
            allFees,
            latestStudents,
            latestPayments
        ] = await Promise.all([
            Course.countDocuments({ creatorId: teacherId }),
            Student.countDocuments({ teacherId: teacherId }),
            Fees.find({ creatorId: teacherId }),
            Student.find({ teacherId: teacherId }).sort({ createdAt: -1 }).limit(5),
            Fees.find({ creatorId: teacherId }).sort({ createdAt: -1 }).limit(5)
        ]);

        // Calculate total revenue from all fee entries
        const totalRevenue = allFees.reduce((sum, record) => sum + record.amount, 0);

        res.status(200).json({
            totalCourses,
            totalStudents,
            totalRevenue,
            latestStudents,
            latestPayments
        });

    } catch (err) {
        console.error("Dashboard Stats Error:", err.message);
        res.status(500).json({
            error: "Could not fetch dashboard statistics",
            details: err.message
        });
    }
});

module.exports = router;