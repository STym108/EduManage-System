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

  const submithandler = async (event) => {
    event.preventDefault();
    setbuttonloader(true)
    const formdata = new FormData();
    formdata.append("fullName", fullname);
    formdata.append("email", email);
    formdata.append("phone", phone);
    formdata.append("password", password);
    formdata.append("image", image);

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
            <input required onChange={(e) => setemail(e.target.value)} type="email" placeholder='Email' />
            <input required onChange={(e) => setPhone(e.target.value)} type="text" placeholder='Phone' />
            <input required onChange={(e) => setpassword(e.target.value)} type='password' placeholder='Password' />
            <input required onChange={imagehandler} type="file" name="image" accept="image/*" />

            {imageurl && <img className='image-url' src={imageurl} alt="preview" />}

            <button  type='submit'>{buttonloader&&<i class="fas fa-spinner fa-spin"></i>}
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