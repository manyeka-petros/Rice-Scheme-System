// src/pages/BlockChairDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../components/AuthContext";
import "./BlockChairDashboard.css";

export default function BlockChairDashboard() {
  const { authToken, user } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [disciplineCases, setDisciplineCases] = useState([]);
  const [totalPlots, setTotalPlots] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken || !user || user.role !== "block_chair") return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [farmersRes, disciplineRes] = await Promise.all([
          axios.get(
            `https://rice-scheme-system-1.onrender.com/farmers/farmers/?block_id=${user.block}&section_id=${user.section}`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          ),
          axios.get(
            `https://rice-scheme-system-1.onrender.com/discipline/cases/?block_id=${user.block}`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          ),
        ]);

        setFarmers(farmersRes.data);
        setDisciplineCases(disciplineRes.data);

        const total = farmersRes.data.reduce(
          (sum, farmer) => sum + (farmer.number_of_plots || 0),
          0
        );
        setTotalPlots(total);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, user]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="block-chair-dashboard">
      <h2 className="dashboard-title">Block Chair Dashboard</h2>

      <div className="stats-container">
        <div className="stat-card stat-card-green">
          <h3 className="stat-title">Total Farmers in Section</h3>
          <p className="stat-value stat-value-green">{farmers.length}</p>
        </div>

        <div className="stat-card stat-card-yellow">
          <h3 className="stat-title">Total Plots</h3>
          <p className="stat-value stat-value-yellow">{totalPlots}</p>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Farmers and Plots</h3>
          <span className="count-badge count-badge-green">
            {farmers.length} farmers
          </span>
        </div>
        <div className="table-container">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Plots</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer) => (
                  <tr key={farmer.id}>
                    <td>
                      {farmer.first_name} {farmer.last_name}
                    </td>
                    <td>
                      <span className="plot-badge">
                        {farmer.number_of_plots || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {farmers.length === 0 && (
            <div className="empty-state">No farmers found in this section.</div>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3 className="section-title">Discipline Cases in Block</h3>
          <span className="count-badge count-badge-red">
            {disciplineCases.length} cases
          </span>
        </div>
        <div className="cases-list">
          {disciplineCases.length ? (
            disciplineCases.map((caseItem) => (
              <div key={caseItem.id} className="case-item">
                <div className="case-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="case-content">
                  <p className="case-name">{caseItem.farmer_name}</p>
                  <p className="case-description">{caseItem.description}</p>
                  {caseItem.date && (
                    <p className="case-date">
                      {new Date(caseItem.date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No discipline cases found.</div>
          )}
        </div>
      </div>
    </div>
  );
}