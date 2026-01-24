import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Style-addcourse.css'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Editcourse = () => {
const navigate=useNavigate();
 const {id}=useParams();
  const [courseName, setCourseName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [startingDate, setStartingDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  

//   fetching all the current values of the course , just copy pasting the viewcourse api function 

const [coursedetail, setcoursedetail] = useState([]);

  const getcoursedetails = async () => {
    try {
      const resp = await axios.get(
        `http://localhost:3000/course/course-detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data=resp.data.course;

      setCourseName(data.courseName);
      setPrice(data.price);
      setDescription(data.description)
      setStartingDate(data.startingDate)
      setEndDate(data.endDate)
      setImage(data.image);

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
      await axios.put(`http://localhost:3000/course/update-course/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
    toast.success("Course Updated  Successfully!");
     navigate('/dashboard/all-courses');
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
          <h2>{courseName}</h2>
          <p>Fill in the details to Edit the course</p>
        </div>
        <form onSubmit={submitHandler} className="course-form">
          <div className="form-grid">
            <div className="input-group">
              <label>Course Title</label>
              <input value={courseName} required type="text"  onChange={(e)=>setCourseName(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Price (INR)</label>
              <input required type="number"  onChange={(e)=>setPrice(e.target.value)} value={price} />
            </div>
            <div className="input-group">
              <label>Starting Date</label>
              <input value={startingDate} required type="date" onChange={(e)=>setStartingDate(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Estimated End Date</label>
              <input value={endDate} required type="date" onChange={(e)=>setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="input-group full-width">
            <label>Course Description</label>
            <textarea value={description} required rows="4"  onChange={(e)=>setDescription(e.target.value)}></textarea>
          </div>
          <div className="image-upload-section">
            <div className="upload-box">
               <label htmlFor="course-img">
                 {preview ? <img src={preview} alt="preview" /> : <span>Click to upload course thumbnail</span>}
               </label>
               <input  type="file" id="course-img" hidden onChange={handleImage} />
            </div>
            <div className="upload-info">
                <p><strong>Upload Cover Image</strong></p>
                <span>Recommended size: 1200x600px (JPG/PNG)</span>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? "Updating Course..." : "Update Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Editcourse;