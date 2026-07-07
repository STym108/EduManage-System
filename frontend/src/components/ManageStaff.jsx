import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from './api.js';
import './allstudentStyle.css'; // Reuse table and layout styles for visual consistency!

const ManageStaff = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form States
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [staffImage, setStaffImage] = useState(null);
    const [buttonLoader, setButtonLoader] = useState(false);

    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem('token');
            const resp = await API.get('/user/staff', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStaffList(resp.data.staff || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to load staff list");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setButtonLoader(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('phone', phone);
            formData.append('email', email);
            formData.append('password', password);
            if (staffImage) {
                formData.append('image', staffImage);
            }

            const resp = await API.post('/user/register-staff', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success(resp.data.message || "Staff registered successfully!");
            // Reset form
            setFullName('');
            setPhone('');
            setEmail('');
            setPassword('');
            setStaffImage(null);
            fetchStaff(); // Reload list
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to register staff account");
        } finally {
            setButtonLoader(false);
        }
    };

    const handleDeleteStaff = async (id) => {
        if (!window.confirm("Are you sure you want to delete this staff member's login?")) return;

        try {
            const token = localStorage.getItem('token');
            await API.delete(`/user/staff/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Staff account deleted successfully!");
            fetchStaff(); // Reload list
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to delete staff account");
        }
    };

    return (
        <div className="all-students-wrapper" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Header section */}
            <div className="students-header" style={{ marginBottom: '10px' }}>
                <h2>Manage Staff & Receptionists</h2>
                <p>Register new staff logins and control system access credentials for your coaching center.</p>
            </div>

            {/* Split Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
                
                {/* Form side */}
                <div style={{ background: '#ffffff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ marginBottom: '20px', color: '#1e293b', fontWeight: '800' }}>Register Staff Account</h3>
                    
                    <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Full Name</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="Enter Full Name" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Phone Number</label>
                            <input 
                                required 
                                type="number" 
                                placeholder="Enter Phone Number" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Email Address</label>
                            <input 
                                required 
                                type="email" 
                                placeholder="Enter Login Email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Login Password</label>
                            <input 
                                required 
                                type="password" 
                                placeholder="Create Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '6px' }}>Profile Photo (Optional)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setStaffImage(e.target.files[0])}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            style={{ width: '100%', background: '#4f46e5', color: '#ffffff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', marginTop: '10px' }}
                        >
                            {buttonLoader && <i className="fas fa-spinner fa-spin"></i>}
                            Create Staff Account
                        </button>
                    </form>
                </div>

                {/* Table side */}
                <div style={{ background: '#ffffff', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', minHeight: '380px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#1e293b', fontWeight: '800' }}>Active Staff logins</h3>
                    
                    {loading ? (
                        <div className="loader" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading Staff List...</div>
                    ) : staffList.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#94a3b8' }}>
                            <i className="fas fa-user-shield" style={{ fontSize: '3rem', marginBottom: '15px', color: '#cbd5e1' }}></i>
                            <p style={{ fontWeight: '600', margin: 0 }}>No Staff Registered Yet</p>
                            <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>Register accounts on the left to delegate workspace tasks.</p>
                        </div>
                    ) : (
                        <div className="students-table-container" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
                            <table className="students-table">
                                <thead>
                                    <tr>
                                        <th>Staff Member</th>
                                        <th>Contact</th>
                                        <th style={{ textAlign: 'center' }}>Role</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffList.map((st) => (
                                        <tr key={st._id}>
                                            <td className="student-profile-cell">
                                                <img src={st.imageUrl} alt="avatar" className="table-avatar" />
                                                <span className="student-name">{st.fullName}</span>
                                            </td>
                                            <td>
                                                <div className="contact-info">
                                                    <span><i className="fas fa-envelope"></i> {st.email}</span>
                                                    <span><i className="fas fa-phone"></i> {st.phone}</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ padding: '4px 10px', background: '#ecfdf5', color: '#047857', borderRadius: '12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                                                    {st.role}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button 
                                                    onClick={() => handleDeleteStaff(st._id)}
                                                    style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem', transition: '0.2s' }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};

export default ManageStaff;
