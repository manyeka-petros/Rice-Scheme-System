import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { useAuth } from "../components/AuthContext";
import "./DisciplineTable.css";

export default function DisciplineTable({ refreshFlag }) {
  const { authToken, user } = useAuth();
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        let listUrl = "http://localhost:8000/discipline/";
        let statsUrl = "http://localhost:8000/discipline/stats/";

        if (user.role === "block_chair" && user.block) {
          listUrl += `?block=${user.block}`;
          statsUrl += `?block_id=${user.block}`;
        }

        const [casesRes, statsRes] = await Promise.all([
          axios.get(listUrl, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get(statsUrl, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        setCases(casesRes.data);
        setStats(statsRes.data);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [refreshFlag, authToken, user]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Confirm Delete",
      text: "This discipline case will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f44336",
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8000/discipline/${id}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCases((prev) => prev.filter((c) => c.id !== id));
      Swal.fire({
        title: "Deleted!",
        text: "Case removed.",
        icon: "success",
        confirmButtonColor: "#f44336",
      });
    } catch {
      Swal.fire({
        title: "Error",
        text: "Failed to delete case.",
        icon: "error",
        confirmButtonColor: "#f44336",
      });
    }
  };

  const badgeColor = {
    open: "danger",
    investigating: "warning",
    hearing_scheduled: "info",
    resolved: "success",
    closed: "secondary",
  };

  const sevColor = {
    minor: "success",
    moderate: "primary",
    serious: "warning",
    critical: "danger",
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading discipline cases...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">Error loading cases: {String(error)}</div>;
  }

  if (!cases.length) {
    return <div className="empty-message">No discipline cases found</div>;
  }

  return (
    <div className="discipline-table-container">
      {stats && (
        <div className="stats-card">
          <h3 className="stats-title">Case Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              Total: <span className="stat-value">{stats.total_cases}</span>
            </div>
            <div className="stat-item">
              Open: <span className="stat-value">{stats.open_cases}</span>
            </div>
            <div className="stat-item">
              Resolved: <span className="stat-value">{stats.resolved_cases}</span>
            </div>
            <div className="stat-item">
              Serious: <span className="stat-value">{stats.cases_by_severity}</span>
            </div>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="discipline-table">
          <thead className="table-header">
            <tr>
              <th>Date</th>
              <th>Farmer</th>
              <th>Offence</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Points</th>
              <th>Action</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="table-row">
                <td>{format(new Date(c.date_reported), "dd MMM yyyy")}</td>
                <td>
                  {c.farmer?.first_name ?? "-"} {c.farmer?.last_name ?? ""}
                </td>
                <td>{(c.offence_type || "").replace(/_/g, " ")}</td>
                <td>
                  <span className={`badge badge-${sevColor[c.severity] || "secondary"}`}>
                    {c.severity}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${badgeColor[c.status] || "secondary"}`}>
                    {c.status}
                  </span>
                </td>
                <td>{c.penalty_points ?? 0}</td>
                <td>{c.action_taken || "-"}</td>
                <td>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="delete-btn"
                    title="Delete case"
                  >
                    🗑
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