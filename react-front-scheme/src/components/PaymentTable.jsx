import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { useAuth } from "../components/AuthContext";
import "./PaymentTable.css";

export default function PaymentTable({ refreshFlag }) {
  const { authToken, user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        let paymentsUrl = "http://localhost:8000/payments/";
        let statsUrl = "http://localhost:8000/payments/stats/";

        if (user.role === "block_chair") {
          paymentsUrl += `?block=${user.block}`;
          statsUrl += `?block_id=${user.block}`;
        }

        const [payRes, statRes] = await Promise.all([
          axios.get(paymentsUrl, {
            headers: { Authorization: `Bearer ${authToken}` }
          }),
          axios.get(statsUrl, {
            headers: { Authorization: `Bearer ${authToken}` }
          })
        ]);

        setPayments(payRes.data);
        setStats(statRes.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data || err.message);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    }

    if (authToken) fetchData();
  }, [refreshFlag, authToken, user]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Confirm Delete",
      text: "This payment record will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel"
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8000/payments/${id}/`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setPayments(p => p.filter(x => x.id !== id));
      Swal.fire("Deleted!", "Payment record removed.", "success");
    } catch (err) {
      Swal.fire("Error!", "Failed to delete payment.", "error");
    }
  };

  const getBadgeClass = (type, value) => {
    const typeClasses = {
      plot_fee: "badge-primary",
      fine: "badge-danger",
      contribution: "badge-success",
      other: "badge-secondary"
    };
    
    const methodClasses = {
      cash: "badge-success",
      airtel: "badge-warning",
      tnm: "badge-info",
      bank: "badge-primary",
      other: "badge-secondary"
    };

    return type === 'payment_type' 
      ? typeClasses[value] || "badge-secondary"
      : methodClasses[value] || "badge-secondary";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading payment records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-alert">
        <div className="error-icon">!</div>
        <div className="error-content">
          <h3>Error Loading Data</h3>
          <p>{String(error)}</p>
        </div>
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💰</div>
        <h3>No Payment Records Found</h3>
        <p>There are no payment records to display at this time.</p>
      </div>
    );
  }

  return (
    <div className="payment-table-container">
      {/* Stats Panel */}
      {stats && (
        <div className="stats-card">
          <h2>Payment Overview</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.total_payments}</div>
              <div className="stat-label">Total Payments</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {Number(stats.total_amount || 0).toLocaleString()}
              </div>
              <div className="stat-label">Total Amount (MWK)</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.verification_stats?.verified}</div>
              <div className="stat-label">Verified</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.verification_stats?.unverified}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Table */}
      <div className="table-wrapper">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Farmer</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td data-label="Date">{format(new Date(p.date_paid), "dd MMM yyyy")}</td>
                <td data-label="Farmer">
                  <div className="farmer-cell">
                    <span className="farmer-name">
                      {p.farmer?.first_name} {p.farmer?.last_name}
                    </span>
                    <span className="farmer-location">
                      {p.farmer?.block?.name}-{p.farmer?.section?.name}
                    </span>
                  </div>
                </td>
                <td data-label="Amount" className="amount-cell">
                  {Number(p.amount).toLocaleString()} MWK
                </td>
                <td data-label="Type">
                  <span className={`badge ${getBadgeClass('payment_type', p.payment_type)}`}>
                    {p.payment_type.replace(/_/g, " ")}
                  </span>
                </td>
                <td data-label="Method">
                  <span className={`badge ${getBadgeClass('method', p.method)}`}>
                    {p.method}
                  </span>
                </td>
                <td data-label="Status">
                  <span className={`badge ${p.is_verified ? 'badge-success' : 'badge-warning'}`}>
                    {p.is_verified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td data-label="Actions" className="actions-cell">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="delete-button"
                    title="Delete payment"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}