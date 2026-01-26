import React from 'react'
import coaching_image from './Assets/signupcover.png'; 
import './style.css'
import { Link, useLocation } from 'react-router-dom'
import Api from './api.js'


const Navbar = () => {
  const location = useLocation(); // Used to highlight the active link

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
    
    <Link to='/dashboard/add-course' className={location.pathname === '/dashboard/add-course' ? 'active' : ''}>
        <i className="fas fa-plus-circle"></i> Add Course
    </Link>
    
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
</div>

        {/* Bottom Section: Footer/Help (Optional) */}
        <div className="sidebar-footer">
            <p>© 2026 SS Academy</p>
        </div>
      </div>
  )
}

export default Navbar