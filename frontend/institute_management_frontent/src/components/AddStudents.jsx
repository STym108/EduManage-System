import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Style-addcourse.css'
import Api from './api.js'

const AddStudents = () => {
  const [StudentName, setStudentName] = useState('');
  const [phone, setphone] = useState('');
  const [address, setaddress] = useState('');
  const [emailstate, setEmail] = useState('');
  const [selectedcourse, setselectedcourse] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courselist, setcourselist] = useState([]); // Initialized as empty array
 
  const dropdownhandler=(e)=>{
    setselectedcourse(e.target.value);
  }

  useEffect(() => {
    getallcourse()
  
  }, []);

  //getting all the courses so that all can be showed in drop down to select the course in which the student is enrolled into
  const getallcourse = async () => {
    try {
      const response = await Api.get('/course/all-courses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // ✅ Log response.data to see exactly where your array is
      // console.log("Server Response:", response.data);
      
      // ✅ Set the array, not the whole response object
      // If your backend sends { courses: [] }, use response.data.courses
      setcourselist(response.data.courses || response.data); 

    } catch (err) {
      console.error(err);
      toast.error('Could not fetch courses');
    }
  };
  //getting all course end
  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('fullName',StudentName);
    formData.append('phone', phone);
    formData.append('email', emailstate);
    formData.append('address', address);
    formData.append('courseId',selectedcourse)
    formData.append('image', image);
    try {
      const token = localStorage.getItem('token');
      await Api.post('/student/add-students', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Student Added Successfully!");
      // Clear form
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add Student");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="form-page-wrapper">
      <div className="form-card">
        <div className="form-header">
          <h2>Add New Student</h2>
          <p>Fill in the details to Add a new Student to a particular Course.</p>
        </div>
        <form onSubmit={submitHandler} className="course-form">
          <div className="form-grid">
            <div className="input-group">
              <label>Student Name</label>
              <input required type="text" placeholder="eg: Shivam Tiwari.." onChange={(e)=>setStudentName(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Student Contact Number (+91)</label>
              <input required type="number"  onChange={(e)=>setphone(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Email Adress</label>
              <input required type="email" onChange={(e)=>setEmail(e.target.value)} />
            </div>
           {/* selecting course code  */}
            <div className="selectcourse">
             <label >Select Course  </label>
             <select name="courses" className='courses-dropdown'
              value={selectedcourse} onChange={dropdownhandler}>
             {courselist.map((course) =>(
             <option key={course._id} value={course._id}>{course.courseName}</option>
             ))}
             </select>
            </div>
          </div>
          <div className="input-group full-width">
            <label>Address</label>
            <textarea required rows="4"  onChange={(e)=>setaddress(e.target.value)}></textarea>
          </div>
          <div className="image-upload-section">
            <div className="upload-box">
               <label htmlFor="course-img">
                 {preview ? <img src={preview} alt="preview" /> : <span>Click to upload Profile</span>}
               </label>
               <input type="file" id="course-img" hidden onChange={handleImage} />
            </div>
            <div className="upload-info">
                <p><strong>Upload Profile Image of Student</strong></p>
                <span>Recommended size: 1200x600px (JPG/PNG)</span>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? "Adding Student..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddStudents;