import React, { useState, useEffect } from "react";
import "./Style.css";
import coaching_image from './Assets/signupcover.png'; 
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom"; // ✅ MUST IMPORT THIS
import userimage from './Assets/user.png'


const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    const handleProfileUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar - Keeping the purple style  */}
     <Navbar/>

      <div className="main-container">
        {/* Topbar with elements aligned to the right */}
        <div className="topbar-container">
          <div className="user-profile-dropdown">
            <div className="dropdown-trigger">
              <img src={user && user.imageUrl ? user.imageUrl : userimage} alt="Profile" className="profile-img" />
              <span className="institute-name" style={{ textTransform: 'capitalize' }}>
                {user ? user.fullName : "Guest User"}
              </span>
              <i className="fas fa-chevron-down dropdown-arrow"></i>
            </div>
            
            <div className="dropdown-menu-list">
              <div className="dropdown-header">
                <strong style={{ textTransform: 'capitalize' }}>{user ? user.fullName : "Guest User"}</strong>
                <span>{user ? user.email : ""}</span>
              </div>
              <hr />
              <button className="dropdown-item" onClick={() => navigate('/dashboard/update-profile')}>
                <i className="fas fa-user-cog"></i> Update Profile
              </button>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
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