import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import API from './api.js';
import cover from './Assets/logincover.png';
import './Style.css';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      return toast.error('Please enter your registered email address.');
    }
    setLoading(true);

    try {
      const response = await API.post('/verify/send-otp', { email });
      toast.success(response.data.message || 'OTP sent successfully!');
      setOtpSent(true);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to send OTP. Please check your email.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP verification code.');
    if (!newPassword) return toast.error('Please enter your new password.');
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match. Please re-enter.');
    }
    setLoading(true);

    try {
      const response = await API.post('/user/reset-password', {
        email,
        otp,
        newPassword
      });
      toast.success(response.data.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Reset failed. Please check the OTP or try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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
          <img src={cover} alt="cover" />
        </div>

        <div className="signup-right">
          <h1>Reset Password</h1>
          
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className='signup-form'>
              <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>
                Enter your registered email address below, and we will send you a 6-digit OTP code to verify your identity.
              </p>
              
              <input 
                required 
                type="email" 
                placeholder='Registered Email' 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
              />

              <button type='submit' disabled={loading}>
                {loading && <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>}
                Send Verification OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className='signup-form'>
              <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>
                An OTP has been sent to <strong>{email}</strong>. Enter the OTP code and your new password below.
              </p>

              <input 
                required 
                type="text" 
                placeholder='6-Digit Verification OTP' 
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)} 
              />

              <input 
                required 
                type='password' 
                placeholder='New Password' 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} 
              />

              <input 
                required 
                type='password' 
                placeholder='Confirm New Password' 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />

              <button type='submit' disabled={loading}>
                {loading && <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>}
                Reset Password
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <span 
                  onClick={handleSendOtp} 
                  style={{ color: '#4f46e5', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
                >
                  Resend OTP Code
                </span>
              </div>
            </form>
          )}

          <div className="create-account">
            <Link className='createaccountlink' to='/login'>Back to Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
