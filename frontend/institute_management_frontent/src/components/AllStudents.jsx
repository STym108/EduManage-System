import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './allstudentStyle.css';

const AllStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchLatestStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const resp = await axios.get('http://localhost:3000/student/latest-students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Based on your backend: res.status(200).json({ students: lateststudents });
            setStudents(resp.data.students);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to load students");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestStudents();
    }, []);

    const handleViewDetail = (id) => {
        navigate(`/dashboard/view-student/${id}`);
    };

    if (loading) return <div className="loader">Loading Students...</div>;

    return (
        <div className="all-students-wrapper">
            <div className="students-header">
                <h2>Recently Added Students</h2>
                <p>Viewing the latest {students.length} students you've registered.</p>
            </div>

            <div className="students-table-container">
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Contact Info</th>
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
                                <td colSpan="4" className="no-data-cell">No students added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllStudents;