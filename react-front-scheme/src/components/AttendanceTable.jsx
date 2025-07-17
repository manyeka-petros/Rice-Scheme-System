import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "../components/AuthContext";
import "./AttendanceTable.css";

export default function AttendanceTable({ refreshFlag }) {
  const { authToken, user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let attendanceUrl = "http://localhost:8000/attendance/";
        let statsUrl = "http://localhost:8000/attendance/stats/";

        if (user.role === "block_chair" && user.block) {
          statsUrl += `?block_id=${user.block}`;
        }

        const [attendanceRes, statsRes] = await Promise.all([
          axios.get(attendanceUrl, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get(statsUrl, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        setRecords(attendanceRes.data);
        setStats(statsRes.data);
        setError(null);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data || err.message);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshFlag, authToken, user]);

  const formatType = (type) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "present": return "status-present";
      case "absent": return "status-absent";
      case "late": return "status-late";
      default: return "status-other";
    }
  };

  const filteredRecords =
    statusFilter === "all"
      ? records
      : records.filter((r) => r.status === statusFilter);

  return (
    <div className="attendance-container">
      {stats && (
        <div className="stats-card">
          <h2>Attendance Overview</h2>
          <div className="stats-grid">
            <div className="stat-item"><div className="stat-value">{stats.total}</div><div className="stat-label">Total</div></div>
            <div className="stat-item">
              <div className="stat-value">{stats.present}</div>
              <div className="stat-label">Present</div>
              <div className="stat-percentage">
                {stats.total ? Math.round((stats.present / stats.total) * 100) : 0}%
              </div>
            </div>
            <div className="stat-item"><div className="stat-value">{stats.absent}</div><div className="stat-label">Absent</div></div>
            <div className="stat-item"><div className="stat-value">{stats.late}</div><div className="stat-label">Late</div></div>
          </div>
        </div>
      )}

      <div className="status-filter">
        <label><input type="radio" value="all" checked={statusFilter === "all"} onChange={() => setStatusFilter("all")} /> All</label>
        <label><input type="radio" value="present" checked={statusFilter === "present"} onChange={() => setStatusFilter("present")} /> Present</label>
        <label><input type="radio" value="absent" checked={statusFilter === "absent"} onChange={() => setStatusFilter("absent")} /> Absent</label>
        <label><input type="radio" value="late" checked={statusFilter === "late"} onChange={() => setStatusFilter("late")} /> Late</label>
      </div>

      <div className="table-wrapper">
        {filteredRecords.length === 0 ? (
          <p className="no-records">No records for selected status.</p>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Farmer</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Recorded By</th>
                <th>Points</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>{format(new Date(record.date), "MMM d, yyyy")}</td>
                  <td>{record.farmer_details?.first_name} {record.farmer_details?.last_name}</td>
                  <td>
                    <div className="location-cell">
                      <span className="block-name">{record.block?.name || "-"}</span>
                      <span className="section-name">{record.section?.name || "-"}</span>
                    </div>
                  </td>
                  <td>{formatType(record.attendance_type)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.recorded_by?.username || "-"}</td>
                  <td>{record.penalty_points || 0}</td>
                  <td>{record.comment || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
