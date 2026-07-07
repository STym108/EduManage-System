import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './allstudentStyle.css';
import API from './api.js'

const AllStudents = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const isAdmin = !userData || userData.role === 'admin';
    
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAllStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const resp = await API.get('/student/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(resp.data.students);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to load students");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllStudents();
    }, []);

    const handleViewDetail = (id) => {
        navigate(`/dashboard/view-student/${id}`);
    };

    if (loading) return <div className="loader">Loading Students...</div>;

    return (
        <div className="all-students-wrapper">
            <div className="students-header">
                <h2>All Registered Students</h2>
                <p>Viewing all students registered at your institute and their tuition payment statuses.</p>
            </div>

            <div className="students-table-container">
                <table className="students-table">
                     <thead>
                        <tr>
                            <th>Student</th>
                            <th>Contact Info</th>
                            <th>Enrolled Courses</th>
                            {isAdmin && <th>Pending Due</th>}
                            <th>Enrolled Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((st) => (
                                <tr key={st._id}>
                                    <td className="student-profile-cell">
                                        <img src={st.imageUrl} alt="profile" className="table-avatar" />
                                        <span className="student-name">{st.fullName}</span>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            <span><i className="fas fa-envelope"></i> {st.email}</span>
                                            <span><i className="fas fa-phone"></i> {st.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            {st.courses && st.courses.length > 0 ? (
                                                st.courses.map((course) => (
                                                    <span 
                                                        key={course._id} 
                                                        style={{ 
                                                            padding: '4px 10px', 
                                                            background: '#eef2ff', 
                                                            color: '#4f46e5', 
                                                            borderRadius: '12px', 
                                                            fontSize: '11px', 
                                                            fontWeight: '600',
                                                            border: '1px solid #c7d2fe'
                                                        }}
                                                    >
                                                        {course.courseName}
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ color: '#999', fontSize: '11px', fontStyle: 'italic' }}>Unassigned</span>
                                            )}
                                        </div>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            {st.outstandingDue > 0 ? (
                                                <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '14px' }}>
                                                    ₹{st.outstandingDue}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#10b981', fontWeight: '700', fontSize: '14px' }}>
                                                    <i className="fas fa-check" style={{ marginRight: '4px' }}></i> Paid
                                                </span>
                                            )}
                                        </td>
                                    )}
                                    <td>
                                        {/* Since your model uses timestamps, we can format the Date */}
                                        {new Date(st.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button 
                                            className="view-btn-small" 
                                            onClick={() => handleViewDetail(st._id)}
                                        >
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isAdmin ? "6" : "5"} className="no-data-cell">No students added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllStudents;