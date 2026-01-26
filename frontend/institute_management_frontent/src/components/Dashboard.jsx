import React from "react";
import "./style.css";
import coaching_image from './Assets/signupcover.png'; 
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom"; // ✅ MUST IMPORT THIS
import userimage from './Assets/user.png'


const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar - Keeping the purple style from your screenshot */}
     <Navbar/>

      <div className="main-container">
        {/* Topbar with elements aligned to the right */}
        <div className="topbar-container">
          <div className="user-profile-section">
            <img src={user&&user.imageUrl} alt={userimage} className="profile-img" />
            <div className="user-info">
              <span className="institute-name">{user ? user.fullName : "Guest User"}</span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
        <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;