import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "./ViewStudentstyle.css";
import API from './api.js'


const Viewstudent = () => {
  // 1. ALL HOOKS AT THE TOP
  const userData = JSON.parse(localStorage.getItem('user'));
  const isAdmin = !userData || userData.role === 'admin';

  const [updatedDate, setUpdatedDate] = useState("");
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for editing
  const [editingPayment, setEditingPayment] = useState(null);
  const [updatedAmount, setUpdatedAmount] = useState("");
  const [updatedRemark, setUpdatedRemark] = useState("");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Student Details
      const studentResp = await API.get(
        `/student/view-student/${id}`,
        { headers }
      );
      const studentData = studentResp.data.details;
      setStudent(studentData);

      // Fetch Payment History using student phone and courseId
      const feeResp = await API.get(
        `/fees/payment-history?courseId=${studentData.courseId}&phone=${studentData.phone}`,
        { headers }
      );
      setPaymentHistory(feeResp.data.payments);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Handlers
  const handleEditClick = (payment) => {
    setEditingPayment(payment);
    setUpdatedAmount(payment.amount);
    setUpdatedRemark(payment.remark);
    setUpdatedDate(new Date(payment.createdAt).toISOString().split("T")[0]);
  };

  const handleUpdateFee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/fees/update-fee/${editingPayment._id}`,
        {
          amount: updatedAmount,
          remark: updatedRemark,
          createdAt: updatedDate, //  Sending the updated date
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Payment Updated!");
      setEditingPayment(null);
      fetchData(); // Refresh the data
    } catch (err) {
      toast.error("Update failed");
    }
  };

  // 2. CONDITIONAL RETURNS AFTER HOOKS
  if (loading) return <div className="loader">Loading...</div>;
  if (!student) return <div className="error">Student not found.</div>;

  const totalPaid = paymentHistory.reduce((sum, item) => sum + item.amount, 0);
  const totalCourseCost = student.courses ? student.courses.reduce((sum, c) => sum + (c.price || 0), 0) : 0;
  const outstandingDue = Math.max(0, totalCourseCost - totalPaid);

  return (
    <div className="student-profile-wrapper">
      <div className="profile-header-card">
        <img
          src={student.imageUrl}
          alt="student"
          className="profile-large-avatar"
        />
        <div className="profile-main-info">
          <h1>{student.fullName}</h1>
          <div className="contact-grid">
            <span>
              <i className="fas fa-envelope"></i> {student.email}
            </span>
            <span>
              <i className="fas fa-phone"></i> {student.phone}
            </span>
            <span>
              <i className="fas fa-map-marker-alt"></i> {student.address}
            </span>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
          <div className="fee-summary-badge" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', minWidth: '120px' }}>
            <span className="label" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold' }}>Total Cost</span>
            <span className="amount" style={{ fontWeight: '800', fontSize: '1.2rem', display: 'block', marginTop: '4px' }}>₹{totalCourseCost}</span>
          </div>
          <div className="fee-summary-badge" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', minWidth: '120px' }}>
            <span className="label" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#047857', fontWeight: 'bold' }}>Total Paid</span>
            <span className="amount" style={{ fontWeight: '800', fontSize: '1.2rem', display: 'block', marginTop: '4px' }}>₹{totalPaid}</span>
          </div>
          <div className="fee-summary-badge" style={{ 
            background: outstandingDue > 0 ? '#fef2f2' : '#f0fdf4', 
            color: outstandingDue > 0 ? '#991b1b' : '#166534', 
            border: outstandingDue > 0 ? '1px solid #fca5a5' : '1px solid #bbf7d0',
            minWidth: '120px' 
          }}>
            <span className="label" style={{ 
              display: 'block', 
              fontSize: '10px', 
              textTransform: 'uppercase', 
              color: outstandingDue > 0 ? '#b91c1c' : '#15803d',
              fontWeight: 'bold'
            }}>
              {outstandingDue > 0 ? "Outstanding Due" : "Fully Paid"}
            </span>
            <span className="amount" style={{ fontWeight: '800', fontSize: '1.2rem', display: 'block', marginTop: '4px' }}>
              {outstandingDue > 0 ? `₹${outstandingDue}` : <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>}
            </span>
          </div>
        </div>
      </div>

      {/* Enrolled Courses / Subjects Section */}
      <div className="payment-history-section" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h3>Enrolled Subjects / Courses</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
          {student.courses && student.courses.length > 0 ? (
            student.courses.map((course) => (
              <div 
                key={course._id} 
                style={{ 
                  padding: '8px 16px', 
                  background: '#eef2ff', 
                  color: '#4f46e5', 
                  borderRadius: '20px', 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  border: '1px solid #c7d2fe',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <i className="fas fa-book"></i>
                {course.courseName} <span style={{ color: '#818cf8', fontWeight: '400' }}>(₹{course.price})</span>
              </div>
            ))
          ) : (
            <span style={{ color: '#888', fontSize: '13px', fontStyle: 'italic' }}>No enrolled subjects.</span>
          )}
        </div>
      </div>

      <div className="payment-history-section">
        <h3>Payment History</h3>
        <div className="table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Remark</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment._id}>
                  <td>
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString()
                      : "Pending"}
                  </td>
                  <td className="amount-cell">₹{payment.amount}</td>
                  <td>{payment.remark}</td>
                  {isAdmin && (
                    <td>
                      <button
                        className="edit-mini-btn"
                        onClick={() => handleEditClick(payment)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay */}
      {editingPayment && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h3>Edit Payment</h3>
            <form onSubmit={handleUpdateFee}>
              <div className="input-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={updatedAmount}
                  onChange={(e) => setUpdatedAmount(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Remark</label>
                <input
                  type="text"
                  value={updatedRemark}
                  onChange={(e) => setUpdatedRemark(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Payment Date</label>
                <input
                  type="date"
                  value={updatedDate}
                  onChange={(e) => setUpdatedDate(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditingPayment(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Viewstudent;
