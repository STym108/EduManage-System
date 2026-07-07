import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Style-addcourse.css';
import API from './api.js';

const UpdateProfile = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setPreview(user.imageUrl || null);
    }
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('phone', phone);
    if (image) {
      formData.append('image', image);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await API.put('/user/update-profile', formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      toast.success("Profile Updated Successfully!");
      
      // Update local storage
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Trigger a custom event to notify Navbar and Dashboard components
      window.dispatchEvent(new Event('userProfileUpdated'));
      
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page-wrapper">
      <div className="form-card">
        <div className="form-header">
          <h2>Update Institute Profile</h2>
          <p>Modify your coaching details, phone number, and official logo banner.</p>
        </div>
        <form onSubmit={submitHandler} className="course-form">
          <div className="form-grid">
            <div className="input-group full-width">
              <label>Coaching/Institute Name</label>
              <input 
                required 
                type="text" 
                value={fullName}
                placeholder="e.g. Acme Coding Classes" 
                onChange={(e) => setFullName(e.target.value)} 
              />
            </div>
            <div className="input-group full-width" style={{ marginTop: '15px' }}>
              <label>Official Phone Number</label>
              <input 
                required 
                type="text" 
                value={phone}
                placeholder="e.g. 9876543210" 
                onChange={(e) => setPhone(e.target.value)} 
              />
            </div>
          </div>

          <div className="image-upload-section" style={{ marginTop: '25px' }}>
            <div className="upload-box" style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '2px dashed #7f4dff' }}>
               <label htmlFor="institute-logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                 {preview ? (
                   <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <span style={{ fontSize: '11px', textAlign: 'center', padding: '10px', color: '#666' }}>Upload Logo</span>
                 )}
               </label>
               <input type="file" id="institute-logo" hidden onChange={handleImage} accept="image/*" />
            </div>
            <div className="upload-info">
                <p><strong>Institute Logo Profile Picture</strong></p>
                <span>Select a square profile picture or logo banner for your coaching center. JPG/PNG accepted.</span>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '30px' }}>
            <button type="submit" disabled={loading} className="primary-btn" style={{ width: '100%', padding: '12px', background: '#7f4dff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' }}>
              {loading ? "Updating Details..." : "Save Profile Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
