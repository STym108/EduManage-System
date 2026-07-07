import React, { useState,useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import './Style.css'
import cover from './Assets/signupcover.png'
import axios from 'axios'
import {toast,ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom'
import API from './api.js'

const Signup = () => {

  const navigate=useNavigate()
  const [fullname, setfullname] = useState('');
  const [email, setemail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setpassword] = useState('');
  const [image, setimage] = useState(null);
  const [imageurl, setimageurl] = useState('');
  const [buttonloader, setbuttonloader] = useState(false);

  // OTP State Hooks
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Handler to request verification OTP
  const sendOtpHandler = async () => {
    if (!email) {
      return toast.error("Please enter your email address first.");
    }
    setOtpLoading(true);
    try {
      const response = await API.post('/verify/send-otp', { email });
      toast.success(response.data.message || "OTP code sent successfully!");
      setOtpSent(true);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to send OTP code. Please try again.";
      toast.error(errorMsg);
    } finally {
      setOtpLoading(false);
    }
  };

  const submithandler = async (event) => {
    event.preventDefault();
    if (otpSent && !otp) {
      return toast.error("Please enter the OTP verification code.");
    }

    setbuttonloader(true)
    const formdata = new FormData();
    formdata.append("fullName", fullname);
    formdata.append("email", email);
    formdata.append("phone", phone);
    formdata.append("password", password);
    formdata.append("image", image);
    formdata.append("otp", otp); // Send OTP along with signup details

    try {
      const response = await API.post(
        "/user/signup",
        formdata,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setbuttonloader(false)
      console.log("Signup success:", response.data);
      toast.success('Account Created Successfully')
      navigate('/login')
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Something went wrong!";
      toast.error(errorMsg);
      setbuttonloader(false)
      console.log("Signup error:", err.response ? err.response.data : err);
    }
  };

  const imagehandler = (e) => {
    setimage(e.target.files[0]);
    setimageurl(URL.createObjectURL(e.target.files[0]));
  };
  return (
    <div className='signup'>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="signup-box">
        <div className="signup-left">
          <img src={cover} alt="cover" />
        </div>

        <div className="signup-right">
          <h1>Create Account</h1>

          <form onSubmit={submithandler} className='signup-form'>
            <input required onChange={(e) => setfullname(e.target.value)} type="text" placeholder='Institute Full Name' />
            
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <input 
                required 
                onChange={(e) => setemail(e.target.value)} 
                type="email" 
                placeholder='Email' 
                style={{ flex: 1, margin: 0 }} 
              />
              <button 
                type="button" 
                onClick={sendOtpHandler} 
                disabled={otpLoading} 
                style={{ width: 'auto', padding: '0 12px', height: '44px', margin: 0, fontSize: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                {otpLoading ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
              </button>
            </div>

            {otpSent && (
              <input 
                required 
                onChange={(e) => setOtp(e.target.value)} 
                type="text" 
                placeholder='6-Digit verification OTP' 
                maxLength="6"
                style={{ marginTop: '10px' }}
              />
            )}

            <input required onChange={(e) => setPhone(e.target.value)} type="text" placeholder='Phone' style={{ marginTop: '10px' }} />
            <input required onChange={(e) => setpassword(e.target.value)} type='password' placeholder='Password' />
            <input required onChange={imagehandler} type="file" name="image" accept="image/*" />

            {imageurl && <img className='image-url' src={imageurl} alt="preview" />}

            <button  type='submit'>{buttonloader&&<i className="fas fa-spinner fa-spin"></i>}
            Submit</button>

          </form>
        
        <div className="create-account">
        <Link className='createaccountlink' to='/Login'>Sign in</Link>
        </div>

        </div>

      </div>
    </div>
  )
}

export default Signup