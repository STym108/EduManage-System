import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './HomeStyle.css';
import Api from './api.js'


const Home = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
    const adminName = userData?.fullName || "Your Institute";
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalStudents: 0,
        totalRevenue: 0,
        latestStudents: [],
        latestPayments: []
    });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const resp = await Api.get('/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Log this to your console to verify the backend is sending data
            console.log("Dashboard Stats:", resp.data);

            // Mapping backend keys to frontend state
            setStats({
                totalCourses: resp.data.totalCourses || 0,
                totalStudents: resp.data.totalStudents || 0,
                totalRevenue: resp.data.totalRevenue || 0,
                latestStudents: resp.data.latestStudents || [],
                latestPayments: resp.data.latestPayments || []
            });
            setLoading(false);
        } catch (err) {
            console.error("Home fetch error:", err);
            toast.error("Failed to load dashboard statistics");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) return <div className="loader">Loading Dashboard...</div>;

    return (
        <div className="home-wrapper">
            {/* 1. Hero Section (The "Wallpaper" Feel) */}
            <div className="home-hero">
                <div className="hero-content">
                    <h1>Welcome back, Admin</h1>
                    <h1>Monitoring <strong>{adminName}</strong> performance for today.</h1>
                </div>
            </div>

            {/* 2. Professional Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card purple">
                    <h3>{stats.totalCourses}</h3>
                    <p>Active Courses</p>
                </div>
                <div className="stat-card pink">
                    <h3>{stats.totalStudents}</h3>
                    <p>Enrolled Students</p>
                </div>
                <div className="stat-card green">
                    <h3>₹{stats.totalRevenue}</h3>
                    <p>Total Revenue</p>
                </div>
            </div>

            {/* 3. Activity Section */}
            <div className="dashboard-content">
                <div className="content-box">
                    <h4>New Admissions</h4>
                    <div className="list-container">
                        {stats.latestStudents.length > 0 ? stats.latestStudents.map(s => (
                            <div key={s._id} className="list-item">
                                <img src={s.imageUrl} alt="student" className="item-img" />
                                <div className="item-info">
                                    <h5>{s.fullName}</h5>
                                    <span>{s.phone}</span>
                                </div>
                            </div>
                        )) : <p className="empty-msg">No new students recently.</p>}
                    </div>
                </div>

                <div className="content-box">
                    <h4>Recent Payments</h4>
                    <div className="list-container">
                        {stats.latestPayments.length > 0 ? stats.latestPayments.map(p => (
                            <div key={p._id} className="list-item payment">
                                <div className="pay-info">
                                    <h5>{p.fullName}</h5>
                                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className="pay-amount">+ ₹{p.amount}</span>
                            </div>
                        )) : <p className="empty-msg">No recent payments recorded.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;