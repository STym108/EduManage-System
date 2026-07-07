import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./viewcourse-style.css";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Deletecourse } from "./DeleteCoursefun";
import { useNavigate } from "react-router-dom";
import API from './api.js'


const ViewCourse = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  const isAdmin = !userData || userData.role === 'admin';

  const navigate = useNavigate();
  const [studentid, setstudentid] = useState();
  const [coursedetail, setcoursedetail] = useState([]);
  const [studentlist, setstudentlist] = useState([]);
  let { id } = useParams();
  const getcoursedetails = async () => {
    try {
      const resp = await API.get(
        `/course/course-detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setcoursedetail(resp.data.course);
      setstudentlist(resp.data.students);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Failed to fetch course details"
      );
      console.log("the error is ", err);
    }
  };
  useEffect(() => {
    getcoursedetails();
  }, [id]);


//   function to trigger a function deleting the course by its id 
  const deletebuttonhandler=async ()=>{
   const result=await Deletecourse(id);
   if(result){
    navigate('/dashboard');
   }
  }

//   below function navigates us to the student detail view page 
 const  StdntDetailhandler= async (studentid)=>{

    navigate(`/dashboard/view-student/${studentid}`)
 }

  return (
    <div className="viewcourse-wrapper">

      {/* 1. Top Section: Organized Course Info Card */}
      {coursedetail && (
        <div className="course-header-card">
          <div className="course-image-box">
            <img
              src={coursedetail.imageUrl}
              alt="Course Cover"
              className="course-cover-img"
            />
          </div>

          <div className="course-info-box">
    {/* /* course delete and edit button  edit button =route to edit page , delete btn=call the delete course api  */}

          {isAdmin && (
            <div className="edit-delete-container">
              <Link to={`/dashboard/edit-course/${id}`} className="edit-link">Edit</Link>
              <button className="delete-button" onClick={deletebuttonhandler} >Delete</button>
            </div>
          )}

            <div className="info-header">
              <h1 className="course-title-text">{coursedetail.courseName}</h1>
              <p className="course-description-text">
                {coursedetail.description}
              </p>
            </div>

            <div className="info-footer">
              <div className="stat-pill">
                <span className="label">Investment</span>
                <span className="value">₹{coursedetail.price}</span>
              </div>
              <div className="stat-pill">
                <span className="label">Batch Start</span>
                <span className="value">{coursedetail.startingDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Bottom Section: Student List */}
      <div className="students-section">
        <div className="section-title">
          <h2>
            Enrolled Students{" "}
            <span className="count-chip">{studentlist.length}</span>
          </h2>
        </div>

        <div className="student-grid">
          {studentlist.map((st) => (
            <div className="student-card" key={st._id}>
              <img src={st.imageUrl} alt="student" className="st-avatar" />
              <div className="st-details">
                <h4>{st.fullName}</h4>
                <p>
                  <i className="fas fa-envelope"></i> {st.email}
                </p>
                <p>
                  <i className="fas fa-phone"></i> {st.phone}
                </p>
                
                {/* Visual tags displaying enrolled courses/subjects */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px', marginBottom: '10px' }}>
                  {st.courses && st.courses.length > 0 ? (
                    st.courses.map((c) => (
                      <span 
                        key={c._id} 
                        style={{ 
                          padding: '2px 8px', 
                          background: c._id === id ? '#eef2ff' : '#f3f4f6', 
                          color: c._id === id ? '#4f46e5' : '#4b5563', 
                          borderRadius: '10px', 
                          fontSize: '10px', 
                          fontWeight: '600',
                          border: c._id === id ? '1px solid #c7d2fe' : '1px solid #e5e7eb'
                        }}
                      >
                        {c.courseName}
                      </span>
                    ))
                  ) : (
                    <span 
                      style={{ 
                        padding: '2px 8px', 
                        background: '#eef2ff', 
                        color: '#4f46e5', 
                        borderRadius: '10px', 
                        fontSize: '10px', 
                        fontWeight: '600',
                        border: '1px solid #c7d2fe'
                      }}
                    >
                      {coursedetail.courseName}
                    </span>
                  )}
                </div>

                <div className="stdntdetail-div">
                    <button className="student-view-btn"
                     onClick={()=>{StdntDetailhandler(st._id)}}> view details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewCourse;
