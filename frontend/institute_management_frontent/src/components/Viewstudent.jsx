import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "./ViewStudentstyle.css";

const Viewstudent = () => {
  // 1. ALL HOOKS AT THE TOP
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
      const studentResp = await axios.get(
        `http://localhost:3000/student/view-student/${id}`,
        { headers }
      );
      const studentData = studentResp.data.details;
      setStudent(studentData);

      // Fetch Payment History using student phone and courseId
      const feeResp = await axios.get(
        `http://localhost:3000/fees/payment-history?courseId=${studentData.courseId}&phone=${studentData.phone}`,
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
      await axios.put(
        `http://localhost:3000/fees/update-fee/${editingPayment._id}`,
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
        <div className="fee-summary-badge">
          <span className="label">Total Paid </span>
          <span className="amount">₹{totalPaid}</span>
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
                <th>Actions</th>
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
                  <td>
                    <button
                      className="edit-mini-btn"
                      onClick={() => handleEditClick(payment)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                  </td>
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
