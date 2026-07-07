import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './paymentHistoryStyle.css';
import API from './api.js'


const PaymentHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const resp = await API.get('/fees/recent-transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(resp.data.transactions);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load transaction history");
            setLoading(false);
        }
    };

    // ✅ DELETE Logic
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this payment record? This will affect total calculations.")) {
            try {
                const token = localStorage.getItem('token');
                await API.delete(`/fees/delete-fee/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Transaction deleted successfully");
                fetchHistory(); // Refresh the list immediately
            } catch (err) {
                toast.error("Failed to delete transaction");
            }
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    if (loading) return <div className="loader">Loading Transactions...</div>;

    return (
        <div className="payment-history-wrapper">
            <div className="history-header">
                <h2>Global Payment History</h2>
                <p>Showing the last 10 fee entries across all your courses.</p>
            </div>

            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Student Name</th>
                            <th>Phone</th>
                            <th>Amount</th>
                            <th>Remark</th>
                            <th>Actions</th> {/* ✅ Added Actions Column */}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <tr key={tx._id}>
                                    <td>
                                        <div className="date-time">
                                            <span className="date">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                            <span className="time">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="student-name-cell">{tx.fullName}</td>
                                    <td className="phone-cell">{tx.phone}</td>
                                    <td className="amount-cell">₹{tx.amount}</td>
                                    <td className="remark-cell">
                                        <span className="remark-tag">{tx.remark}</span>
                                    </td>
                                    <td>
                                        {/* ✅ Delete Button */}
                                        <button 
                                            className="delete-mini-btn" 
                                            onClick={() => handleDelete(tx._id)}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">No transactions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentHistory;