import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./allcourses-styling.css";
import { Link } from "react-router-dom";
const Allcourses = () => {
  const [courselist, setcourselist] = useState([]); // Initialized as empty array

  //fun for course detail rendering when 'view details 'clicked , passing the course id as prop

  useEffect(() => {
    getallcourse();
  }, []);

  const getallcourse = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/course/all-courses",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // ✅ Log response.data to see exactly where your array is
      console.log("Server Response:", response.data);

      // ✅ Set the array, not the whole response object
      // If your backend sends { courses: [] }, use response.data.courses
      setcourselist(response.data.courses || response.data);
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch courses");
    }
  };

  return (
    <div className="courses-container" style={{ padding: "20px" }}>
      <h2>All Available Courses</h2>
      <div className="courses-grid">
        {courselist.map((course) => (
          <div key={course._id} className="course-card">
            <div className="course-image-wrapper">
              <img
                src={course.imageUrl}
                alt={course.courseName}
                className="course-card-img"
              />
              <span className="price-badge">₹{course.price}</span>
            </div>

            <div className="course-card-content">
              <h3 className="course-title">{course.courseName}</h3>

              <div className="course-card-footer">
                <div className="date-info">
                  <i className="far fa-calendar-alt"></i>
                  <span>{course.startingDate}</span>
                </div>
                <div className="course-detail-btn">
                <Link className="course-detail-btnl" to={`/dashboard/view-course/${course._id}`}>
                  {" "}
                  Course Details
                </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Allcourses;
