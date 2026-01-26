import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './CollectFeesstyle.css';
import API from './api.js'

const CollectFee = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        phone: '',
        courseId: '',
        amount: '',
        fullName: '', // Admin can verify/enter name
        remark: ''
    });

    // 1. Fetch courses to populate the dropdown
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const resp = await API.get('/course/all-courses', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                // Assuming backend returns { courses: [] } or just []
                setCourses(resp.data.courses || resp.data);
            } catch (err) {
                toast.error("Failed to load courses");
            }
        };
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            // The structured logic we discussed: sending phone and courseId as identifiers
            const resp = await Api.post('/fees/add-fees', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success("Fee Recorded Successfully!");
            // Reset form except for course (to make multiple entries faster)
            setFormData({ ...formData, phone: '', amount: '', fullName: '', remark: '' });
        } catch (err) {
            // This catches the "student not found" or "not enrolled" error from your backend
            toast.error(err.response?.data?.error || "Student not found in this course");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fee-page-container">
            <div className="fee-card">
                <div className="fee-header">
                    <h2>Collect Student Fee</h2>
                    <p>Enter payment details for an enrolled student.</p>
                </div>

                <form onSubmit={submitHandler} className="fee-form">
                    <div className="input-row">
                        <div className="input-group">
                            <label>Select Course</label>
                            <select 
                                name="courseId" 
                                required 
                                value={formData.courseId} 
                                onChange={handleChange}
                            >
                                <option value="">-- Choose Course --</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>
                                        {course.courseName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Student Phone Number</label>
                            <input 
                                name="phone"
                                type="number" 
                                required 
                                placeholder="Enter registered phone" 
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>Student Full Name</label>
                            <input 
                                name="fullName"
                                type="text" 
                                required 
                                placeholder="Verification name" 
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <label>Amount (₹)</label>
                            <input 
                                name="amount"
                                type="number" 
                                required 
                                placeholder="0.00" 
                                value={formData.amount}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-group full-width">
                        <label>Remark / Payment Note</label>
                        <textarea 
                            name="remark"
                            rows="3" 
                            placeholder="e.g. Cash, UPI, Part-payment..."
                            value={formData.remark}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <button type="submit" className="submit-fee-btn" disabled={loading}>
                        {loading ? "Processing..." : "Confirm & Save Payment"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CollectFee;