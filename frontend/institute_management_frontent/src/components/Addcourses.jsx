import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Style-addcourse.css'
const Addcourses = () => {
  const [courseName, setCourseName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [startingDate, setStartingDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userData = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    formData.append('courseName', courseName);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('startingDate', startingDate);
    formData.append('endDate', endDate);
    formData.append('image', image);


    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/course/add-course', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Course Published Successfully!");
      // Clear form
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add course");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="form-page-wrapper">
      <div className="form-card">
        <div className="form-header">
          <h2>Create New Course</h2>
          <p>Fill in the details to publish a new course to your institute.</p>
        </div>
        <form onSubmit={submitHandler} className="course-form">
          <div className="form-grid">
            <div className="input-group">
              <label>Course Title</label>
              <input required type="text" placeholder="e.g. Full Stack Web Development" onChange={(e)=>setCourseName(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Price (INR)</label>
              <input required type="number" placeholder="0.00" onChange={(e)=>setPrice(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Starting Date</label>
              <input required type="date" onChange={(e)=>setStartingDate(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Estimated End Date</label>
              <input required type="date" onChange={(e)=>setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="input-group full-width">
            <label>Course Description</label>
            <textarea required rows="4" placeholder="What will students learn in this course?" onChange={(e)=>setDescription(e.target.value)}></textarea>
          </div>
          <div className="image-upload-section">
            <div className="upload-box">
               <label htmlFor="course-img">
                 {preview ? <img src={preview} alt="preview" /> : <span>Click to upload course thumbnail</span>}
               </label>
               <input type="file" id="course-img" hidden onChange={handleImage} />
            </div>
            <div className="upload-info">
                <p><strong>Upload Cover Image</strong></p>
                <span>Recommended size: 1200x600px (JPG/PNG)</span>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? "Publishing..." : "Publish Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Addcourses;