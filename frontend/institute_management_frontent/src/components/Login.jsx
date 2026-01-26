import React, { useState,useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import './Style.css'
import cover from './Assets/logincover.png'
import axios from 'axios'
import {toast,ToastContainer} from 'react-toastify';
import API from './api.js'

import 'react-toastify/dist/ReactToastify.css';

import { Link } from 'react-router-dom';
const Login = () => {

  const navigate=useNavigate()

  const [email, setemail] = useState('');

  const [password, setpassword] = useState('');


const [buttonloader, setbuttonloader] = useState(false);

  const submithandler = async (event) => {
    event.preventDefault();
    setbuttonloader(true)
    
    try {
      const response = await API.post(
        "/user/Login",
        {email:email,
          password:password
        },
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      // ✅ THIS IS WHERE THE STORAGE HAPPENS
      localStorage.setItem('token', response.data.token);
        
      // It is also helpful to store user info to show their name/profile pic
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setbuttonloader(false)
      console.log("Login success:", response.data);
      toast.success('Logged in Successfully')
      navigate('/dashboard')
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Something went wrong!";
      toast.error(errorMsg);
      setbuttonloader(false)
      console.log("Login error:", err.response ? err.response.data : err);
    }
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
          <h1></h1>
          <img src={cover} alt="cover" />
        </div>

        <div className="signup-right">
          <h1>Sign in</h1>

          <form onSubmit={submithandler} className='signup-form'>

            <input required onChange={(e) => setemail(e.target.value)} type="email" placeholder='Email' />

            <input required onChange={(e) => setpassword(e.target.value)} type='password' placeholder='Password' />




            <button  type='submit'>{buttonloader&&<i class="fas fa-spinner fa-spin"></i>}
            Submit</button>
          </form>
        <div className="create-account">
        <Link className='createaccountlink' to='/signup'>Create Your Account</Link>
        </div>
        </div>

      </div>
    </div>
  )
}

export default Login