import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  ArcElement
} from "chart.js";
import Swal from "sweetalert2";
import { useAuth } from "../components/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorAlert from "../components/ErrorAlert";
import { FiUsers, FiCalendar, FiDollarSign, FiPieChart, FiRefreshCw, FiSearch, FiFilter, FiEdit, FiCheck, FiX } from "react-icons/fi";
import "./DashboardPage.css";

// Register Chart.js components
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, ArcElement);

function StatCard({ title, value, icon, color = "blue", isLoading = false, trend, subtitle }) {
  const trendColor = trend?.value > 0 ? "#38a169" : trend?.value < 0 ? "#e53e3e" : "#718096";
  
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-content">
        <div>
          <p className="stat-title">{title}</p>
          <div className="stat-value">
            {isLoading ? <span className="loading-pulse" /> : value}
          </div>
          {subtitle && <p className="stat-subtitle">{subtitle}</p>}
          {trend && (
            <div className="stat-trend" style={{ color: trendColor }}>
              {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'} {Math.abs(trend.value)}% {trend.label}
            </div>
          )}
        </div>
        <div className="stat-icon">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { authToken, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [formStates, setFormStates] = useState({});
  const [userSections, setUserSections] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isEditing, setIsEditing] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // Load dashboard data
  useEffect(() => {
    if (activeTab !== "overview") return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const statsRes = await axios.get("http://localhost:8000/farmers/dashboard/stats/", {
          headers: { Authorization: `Bearer ${authToken}` },
          timeout: 10000
        });
        setDashboardStats(statsRes.data);
      } catch (err) {
        setError(err.response?.data || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [authToken, activeTab, refresh]);

  // Load users and blocks for management tab
  useEffect(() => {
    if (activeTab !== "management" || !authToken) return;

    const fetchUsersAndBlocks = async () => {
      try {
        setLoading(true);
        const [usersRes, blocksRes] = await Promise.all([
          axios.get("http://localhost:8000/accounts/users/", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("http://localhost:8000/farmers/blocks/", {
            headers: { Authorization: `Bearer ${authToken}` },
          })
        ]);

        setUsers(usersRes.data);
        setFilteredUsers(usersRes.data);
        setBlocks(blocksRes.data);

        const initialStates = {};
        usersRes.data.forEach((user) => {
          initialStates[user.id] = {
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            role: user.role || "",
            is_approved: user.is_approved || false,
            block: user.block || "",
            section: user.section || "",
          };
        });
        setFormStates(initialStates);
      } catch (err) {
        setError(err.response?.data || "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndBlocks();
  }, [authToken, activeTab, refresh]);

  // Filter users based on search and filters
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      result = result.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.first_name && u.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.last_name && u.last_name.toLowerCase().includes(searchTerm.toLowerCase())))
    }
    
    if (roleFilter !== "all") {
      result = result.filter(u => u.role === roleFilter);
    }
    
    if (statusFilter !== "all") {
      result = result.filter(u => 
        statusFilter === "approved" ? u.is_approved : !u.is_approved
      );
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchSectionsForUser = async (userId, blockId) => {
    if (!blockId) return;
    try {
      const res = await axios.get(`http://localhost:8000/accounts/filtered-sections/?block_id=${blockId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUserSections((prev) => ({ ...prev, [userId]: res.data }));
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    }
  };

  const handleChange = (userId, field, value) => {
    setFormStates((prev) => {
      const updated = {
        ...prev[userId],
        [field]: value,
      };

      if (field === "block") {
        updated.section = "";
        fetchSectionsForUser(userId, value);
      }

      return {
        ...prev,
        [userId]: updated,
      };
    });
  };

  const handleSubmit = async (userId) => {
    const data = formStates[userId];

    try {
      const res = await axios.patch(
        `http://localhost:8000/accounts/users/${userId}/`, 
        data, 
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setIsEditing(null);
      setRefresh(!refresh);

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `${res.data.username} has been updated.`,
        timer: 2000,
        showConfirmButton: false,
        background: '#fff',
        backdrop: `
          rgba(0,0,0,0.05)
          left top
          no-repeat
        `
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Update failed. Please check the inputs or try again.",
        background: '#fff',
      });
      console.error(err);
    }
  };

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  const toggleEdit = (userId) => {
    setIsEditing(isEditing === userId ? null : userId);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <ErrorAlert message={String(error)} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  // Chart data for plot distribution
  const plotChartData = {
    labels: dashboardStats?.plots_summary?.map(p => `${p.block__name}-${p.section__name}`) || [],
    datasets: [{
      label: "Total Plots",
      data: dashboardStats?.plots_summary?.map(p => p.total_plots) || [],
      backgroundColor: "rgba(99, 102, 241, 0.7)",
      borderColor: "rgba(79, 70, 229, 1)",
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  // Chart data for roles distribution
  const rolesData = {
    labels: dashboardStats?.roles_distribution?.map(r => r.role) || [],
    datasets: [{
      data: dashboardStats?.roles_distribution?.map(r => r.count) || [],
      backgroundColor: [
        'rgba(99, 102, 241, 0.7)',
        'rgba(56, 161, 105, 0.7)',
        'rgba(234, 179, 8, 0.7)',
        'rgba(217, 119, 6, 0.7)',
        'rgba(220, 38, 38, 0.7)'
      ],
      borderColor: [
        'rgba(79, 70, 229, 1)',
        'rgba(47, 133, 90, 1)',
        'rgba(202, 138, 4, 1)',
        'rgba(180, 83, 9, 1)',
        'rgba(185, 28, 28, 1)'
      ],
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            family: "'Inter', sans-serif"
          }
        }
      },
      tooltip: { 
        callbacks: { label: ctx => `${ctx.dataset.label || ctx.label}: ${ctx.raw}` },
        displayColors: true,
        backgroundColor: "#1F2937",
        titleColor: "#F9FAFB",
        bodyColor: "#F9FAFB",
        borderColor: "#374151",
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        titleFont: {
          family: "'Inter', sans-serif"
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        ticks: { 
          stepSize: 5,
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif"
          }
        }, 
        grid: { 
          color: "rgba(229, 231, 235, 0.5)",
          drawBorder: false
        } 
      },
      x: { 
        grid: { 
          display: false,
          drawBorder: false
        },
        ticks: {
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif"
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif"
          }
        }
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome back, {user?.first_name || 'Admin'}!</h1>
            <p className="last-updated">
              {activeTab === "overview" ? `Last updated: ${new Date().toLocaleString()}` : 'Manage user accounts and permissions'}
            </p>
          </div>
          <div className="header-actions">
            <button className="refresh-button" onClick={handleRefresh}>
              <FiRefreshCw /> Refresh
            </button>
            <div className="dashboard-tabs">
              <button 
                className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <FiPieChart /> Overview
              </button>
              <button 
                className={`tab-button ${activeTab === "management" ? "active" : ""}`}
                onClick={() => setActiveTab("management")}
              >
                <FiUsers /> User Management
              </button>
            </div>
          </div>
        </div>
      </header>

      {activeTab === "overview" ? (
        <>
          {/* Key Metrics */}
          <section className="metrics-grid">
            <StatCard 
              title="Total Farmers" 
              value={dashboardStats?.total_farmers?.toLocaleString() || '0'} 
              icon={<FiUsers size={24} />}
              color="blue"
              trend={{ value: 12, label: "vs last month" }}
              subtitle={`${dashboardStats?.active_farmers || '0'} active`}
            />
            <StatCard 
              title="Attendance Rate" 
              value={`${(dashboardStats?.attendance_rate || 0).toFixed(1)}%`} 
              icon={<FiCalendar size={24} />}
              color="green"
              trend={{ value: -2.5, label: "vs last week" }}
              subtitle={`${dashboardStats?.present_today || '0'} present today`}
            />
            <StatCard 
              title="Fines Collected" 
              value={`MWK ${Number(dashboardStats?.fines_collected || 0).toLocaleString()}`} 
              icon={<FiDollarSign size={24} />}
              color="amber"
              trend={{ value: 18, label: "vs last month" }}
              subtitle={`${dashboardStats?.unpaid_fines || '0'} unpaid`}
            />
          </section>

          <div className="data-grid">
            {/* Unpaid Farmers */}
            <section className="data-card">
              <div className="card-header">
                <h2>Unpaid Farmers</h2>
                <p className="card-subtitle">
                  Top {dashboardStats?.top_unpaid?.length || 0} with outstanding balances
                </p>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Farmer</th>
                      <th>Location</th>
                      <th className="text-right">Amount Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardStats?.top_unpaid?.length > 0 ? (
                      dashboardStats.top_unpaid.map(f => (
                        <tr key={f.id}>
                          <td>
                            <div className="user-cell">
                              <span className="user-avatar">{f.name.charAt(0)}</span>
                              {f.name}
                            </div>
                          </td>
                          <td>{f.block} • {f.section}</td>
                          <td className="text-right amount-due">
                            MWK {Number(f.paid).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="no-data">
                          No unpaid farmers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Plot Distribution */}
            <section className="data-card">
              <div className="card-header">
                <h2>Plot Distribution</h2>
                <p className="card-subtitle">Breakdown by block and section</p>
              </div>
              <div className="chart-container">
                {plotChartData.labels.length > 0 ? (
                  <Bar data={plotChartData} options={chartOptions} />
                ) : (
                  <div className="no-chart-data">
                    No plot distribution data available
                  </div>
                )}
              </div>
            </section>

            {/* Roles Distribution */}
            <section className="data-card">
              <div className="card-header">
                <h2>User Roles Distribution</h2>
                <p className="card-subtitle">Breakdown by user roles</p>
              </div>
              <div className="chart-container">
                {rolesData.labels.length > 0 ? (
                  <Pie data={rolesData} options={pieOptions} />
                ) : (
                  <div className="no-chart-data">
                    No roles distribution data available
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="management-container">
          <div className="management-header">
            <h2>User Management</h2>
            <div className="management-controls">
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <div className="filter-item">
                  <label>Role:</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="farmer">Farmer</option>
                    <option value="block_chair">Block Chair</option>
                    <option value="president">President</option>
                    <option value="treasurer">Treasurer</option>
                    <option value="secretary">Secretary</option>
                  </select>
                </div>
                <div className="filter-item">
                  <label>Status:</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="users-grid">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const form = formStates[user.id] || {};
                const sections = userSections[user.id] || [];
                const isActiveEdit = isEditing === user.id;

                return (
                  <div key={user.id} className={`user-card ${user.is_approved ? 'approved' : 'pending'}`}>
                    <div className="user-card-header">
                      <div className="user-avatar">{user.username.charAt(0)}</div>
                      <div className="user-info">
                        <h4>{user.username}</h4>
                        <span className={`user-role ${user.role}`}>{user.role}</span>
                      </div>
                      <div className="user-actions">
                        {isActiveEdit ? (
                          <>
                            <button 
                              className="action-button save"
                              onClick={() => handleSubmit(user.id)}
                            >
                              <FiCheck />
                            </button>
                            <button 
                              className="action-button cancel"
                              onClick={() => toggleEdit(user.id)}
                            >
                              <FiX />
                            </button>
                          </>
                        ) : (
                          <button 
                            className="action-button edit"
                            onClick={() => toggleEdit(user.id)}
                          >
                            <FiEdit />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="user-details">
                      <div className={`form-group ${isActiveEdit ? 'editable' : ''}`}>
                        <label>First Name:</label>
                        {isActiveEdit ? (
                          <input
                            type="text"
                            value={form.first_name}
                            onChange={(e) => handleChange(user.id, "first_name", e.target.value)}
                          />
                        ) : (
                          <div className="form-value">{user.first_name || '-'}</div>
                        )}
                      </div>

                      <div className={`form-group ${isActiveEdit ? 'editable' : ''}`}>
                        <label>Last Name:</label>
                        {isActiveEdit ? (
                          <input
                            type="text"
                            value={form.last_name}
                            onChange={(e) => handleChange(user.id, "last_name", e.target.value)}
                          />
                        ) : (
                          <div className="form-value">{user.last_name || '-'}</div>
                        )}
                      </div>

                      <div className={`form-group ${isActiveEdit ? 'editable' : ''}`}>
                        <label>Role:</label>
                        {isActiveEdit ? (
                          <select
                            value={form.role}
                            onChange={(e) => handleChange(user.id, "role", e.target.value)}
                          >
                            <option value="">-- Select Role --</option>
                            <option value="farmer">Farmer</option>
                            <option value="block_chair">Block Chair</option>
                            <option value="president">President</option>
                            <option value="treasurer">Treasurer</option>
                            <option value="secretary">Secretary</option>
                          </select>
                        ) : (
                          <div className="form-value">{user.role || '-'}</div>
                        )}
                      </div>

                      {form.role === "block_chair" && (
                        <>
                          <div className={`form-group ${isActiveEdit ? 'editable' : ''}`}>
                            <label>Block:</label>
                            {isActiveEdit ? (
                              <select
                                value={form.block}
                                onChange={(e) => handleChange(user.id, "block", e.target.value)}
                              >
                                <option value="">-- Select Block --</option>
                                {blocks.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="form-value">
                                {blocks.find(b => b.id === user.block)?.name || '-'}
                              </div>
                            )}
                          </div>

                          <div className={`form-group ${isActiveEdit ? 'editable' : ''}`}>
                            <label>Section:</label>
                            {isActiveEdit ? (
                              <select
                                value={form.section}
                                onChange={(e) => handleChange(user.id, "section", e.target.value)}
                              >
                                <option value="">-- Select Section --</option>
                                {sections.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="form-value">
                                {sections.find(s => s.id === user.section)?.name || '-'}
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      <div className={`form-group checkbox-group ${isActiveEdit ? 'editable' : ''}`}>
                        <label>
                          {isActiveEdit ? (
                            <input
                              type="checkbox"
                              checked={form.is_approved}
                              onChange={(e) => handleChange(user.id, "is_approved", e.target.checked)}
                            />
                          ) : (
                            <input
                              type="checkbox"
                              checked={user.is_approved}
                              readOnly
                            />
                          )}
                          <span>Approved</span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-users">
                <p>No users found matching your criteria</p>
                <button 
                  className="clear-filters"
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}