import React, { useState, useEffect } from 'react'
import coaching_image from './Assets/signupcover.png'; 
import './Style.css'
import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation(); // Used to highlight the active link
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    const handleProfileUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };
    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdated', handleProfileUpdate);
  }, []);

  const isAdmin = !user || user.role === 'admin';

  return (
    <div className="nav-container">
        {/* Top Section: Logo & Name */}
        <div className="sidebar-header">
           <img src={coaching_image} alt="logo" className="profile-img"/>
           <h3>EduManage System</h3>
        </div>

        {/* Middle Section: Menu Links */}
        <div className="menu">
            <Link to='/dashboard' className={location.pathname === '/dashboard' ? 'active' : ''}>
                <i className="fas fa-home"></i> Home
            </Link>
            
            <Link to='/dashboard/all-courses' className={location.pathname === '/dashboard/all-courses' ? 'active' : ''}>
                <i className="fas fa-book"></i> All Courses
            </Link>
            
            {isAdmin && (
                <Link to='/dashboard/add-course' className={location.pathname === '/dashboard/add-course' ? 'active' : ''}>
                    <i className="fas fa-plus-circle"></i> Add Course
                </Link>
            )}
            
            <Link to='/dashboard/add-students' className={location.pathname === '/dashboard/add-students' ? 'active' : ''}>
                <i className="fas fa-user-plus"></i> Add Student
            </Link>
            
            <Link to='/dashboard/all-students' className={location.pathname === '/dashboard/all-students' ? 'active' : ''}>
                <i className="fas fa-users"></i> All Students
            </Link>
            
            <Link to='/dashboard/collect-fee' className={location.pathname === '/dashboard/collect-fee' ? 'active' : ''}>
                <i className="fas fa-rupee-sign"></i> Collect Fee
            </Link>
            
            <Link to='/dashboard/payment-history' className={location.pathname === '/dashboard/payment-history' ? 'active' : ''}>
                <i className="fas fa-history"></i> Payment History
            </Link>

            {isAdmin && (
                <>
                    <Link to='/dashboard/manage-staff' className={location.pathname === '/dashboard/manage-staff' ? 'active' : ''}>
                        <i className="fas fa-user-shield"></i> Manage Staff
                    </Link>
                    <Link to='/dashboard/update-profile' className={location.pathname === '/dashboard/update-profile' ? 'active' : ''}>
                        <i className="fas fa-user-cog"></i> Update Profile
                    </Link>
                </>
            )}
        </div>

        {/* Bottom Section: Footer with dynamic institute name */}
        <div className="sidebar-footer">
            <p>© 2026 {user ? user.fullName : "SS Academy"}</p>
        </div>
      </div>
  )
}

export default Navbar