const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/courses');
const Student = require('../models/students');
const Fees = require('../models/fees');
const checkAuth = require('../middleware/checkAuth');

router.get('/', checkAuth, async (req, res) => {
    try {
        const teacherId = req.userData.adminId;

        // Execute all queries in parallel for better performance
        const [
            totalCourses,
            totalStudents,
            allFees,
            allStudentsDocs,
            teacherCourses,
            latestStudents,
            latestPayments
        ] = await Promise.all([
            Course.countDocuments({ creatorId: teacherId }),
            Student.countDocuments({ teacherId: teacherId }),
            Fees.find({ creatorId: teacherId }),
            Student.find({ teacherId: teacherId }),
            Course.find({ creatorId: teacherId }),
            Student.find({ teacherId: teacherId }).populate('courses').sort({ createdAt: -1 }).limit(5),
            Fees.find({ creatorId: teacherId }).sort({ createdAt: -1 }).limit(5)
        ]);

        // Map course IDs to their prices
        const coursePriceMap = {};
        teacherCourses.forEach(c => {
            coursePriceMap[c._id.toString()] = c.price || 0;
        });

        // Calculate expected revenue from student course enrollments
        let totalExpectedRevenue = 0;
        allStudentsDocs.forEach(st => {
            if (st.courses && st.courses.length > 0) {
                st.courses.forEach(cId => {
                    totalExpectedRevenue += coursePriceMap[cId.toString()] || 0;
                });
            } else if (st.courseId) {
                // Fallback for legacy courseId
                totalExpectedRevenue += coursePriceMap[st.courseId.toString()] || 0;
            }
        });

        // Calculate total revenue from all fee entries
        const totalRevenue = allFees.reduce((sum, record) => sum + record.amount, 0);
        
        // Calculate outstanding pending dues
        const totalDues = Math.max(0, totalExpectedRevenue - totalRevenue);

        res.status(200).json({
            totalCourses,
            totalStudents,
            totalRevenue,
            totalDues,
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