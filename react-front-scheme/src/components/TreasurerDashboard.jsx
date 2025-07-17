import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import './TreasurerDashboard.css';

export default function TreasurerDashboard() {
  const { authToken } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [farmersRes, paymentsRes] = await Promise.all([
          axios.get("http://localhost:8000/farmers/farmers/?limit=1000", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("http://localhost:8000/payments/", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        const farmerData = Array.isArray(farmersRes.data)
          ? farmersRes.data
          : farmersRes.data.results || [];

        setFarmers(farmerData);
        setPayments(paymentsRes.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  const totalFarmers = farmers.length;
  const farmersPaidIds = payments.map((p) => p.farmer_id);
  const uniquePaidIds = [...new Set(farmersPaidIds)];
  const paidCount = uniquePaidIds.length;

  const farmersWithBalance = farmers.filter((farmer) => {
    const totalPaid = payments
      .filter((p) => p.farmer_id === farmer.id)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const expectedAmount = farmer.number_of_plots * farmer.price_per_plot;
    return totalPaid < expectedAmount;
  });

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="treasurer-dashboard">
      <header className="dashboard-header">
        <h1>Treasurer Dashboard</h1>
        <p className="dashboard-subtitle">Payment management overview</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-farmers-icon">👨‍🌾</div>
          <div className="stat-content">
            <h3>Total Farmers</h3>
            <p className="stat-value">{totalFarmers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon paid-icon">💵</div>
          <div className="stat-content">
            <h3>Farmers Paid</h3>
            <p className="stat-value">{paidCount}</p>
            <p className="stat-percentage">{Math.round((paidCount / totalFarmers) * 100)}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon balance-icon">📊</div>
          <div className="stat-content">
            <h3>With Balance</h3>
            <p className="stat-value">{farmersWithBalance.length}</p>
            <p className="stat-percentage">{Math.round((farmersWithBalance.length / totalFarmers) * 100)}%</p>
          </div>
        </div>
      </div>

      <div className="balance-section">
        <div className="section-header">
          <h2>Farmers with Outstanding Balances</h2>
          <p className="section-subtitle">{farmersWithBalance.length} farmers have unpaid balances</p>
        </div>

        <div className="balance-table-container">
          <table className="balance-table">
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Plots</th>
                <th>Paid</th>
                <th>Expected</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {farmersWithBalance.map((f) => {
                const totalPaid = payments
                  .filter((p) => p.farmer_id === f.id)
                  .reduce((sum, p) => sum + Number(p.amount), 0);
                const expected = f.number_of_plots * f.price_per_plot;
                const balance = expected - totalPaid;

                return (
                  <tr key={f.id}>
                    <td data-label="Farmer">
                      <div className="farmer-name">
                        <span className="farmer-avatar">{f.first_name.charAt(0)}{f.last_name.charAt(0)}</span>
                        {f.first_name} {f.last_name}
                      </div>
                    </td>
                    <td data-label="Plots">{f.number_of_plots}</td>
                    <td data-label="Paid">{totalPaid.toLocaleString()}</td>
                    <td data-label="Expected">{expected.toLocaleString()}</td>
                    <td data-label="Balance" className="balance-amount">
                      <span className="balance-badge">{balance.toLocaleString()}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {farmersWithBalance.length === 0 && (
          <div className="no-balances">
            <p>All farmers have paid in full! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}