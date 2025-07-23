import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../components/AuthContext";
import "./attendance.css";

const initialForm = {
  farmer: "",
  block: "",
  section: "",
  date: new Date().toISOString().slice(0, 10),
  attendance_type: "main_canal_cleaning",
  status: "present",
  comment: "",
  penalty_points: 0,
};

const activityTypes = [
  { id: "general_assembly", label: "General Assembly" },
  { id: "main_canal_cleaning", label: "Main Canal Cleaning" },
  { id: "block_canal_cleaning", label: "Block Canal Cleaning" },
];

const statusOptions = [
  { id: "present", label: "Present" },
  { id: "absent", label: "Absent" },
  { id: "late", label: "Late" },
  { id: "excused", label: "Excused" },
];

export default function AttendanceForm({ onSaved }) {
  const { authToken, user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Set block/section automatically if block_chair
  useEffect(() => {
    if (user?.role === "block_chair") {
      setForm((prev) => ({
        ...prev,
        block: user.block || "",
        section: user.section || "",
      }));
    }
  }, [user]);

  // Fetch farmers and blocks
  useEffect(() => {
    const fetchData = async () => {
      try {
        let farmersUrl = "https://rice-scheme-system-1.onrender.com/farmers/farmers/";
        if (user?.role === "block_chair" && user.block && user.section) {
          farmersUrl += `?block_id=${user.block}&section_id=${user.section}`;
        }

        const [farmersRes, blocksRes] = await Promise.all([
          axios.get(farmersUrl, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("https://rice-scheme-system-1.onrender.com/farmers/blocks/", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        setFarmers(
          Array.isArray(farmersRes.data)
            ? farmersRes.data
            : farmersRes.data.results || []
        );

        setBlocks(blocksRes.data);
      } catch (err) {
        Swal.fire("Error", "Failed to fetch data", "error");
        console.error(err);
      }
    };

    fetchData();
  }, [authToken, user]);

  // Fetch sections when block changes (for admin)
  useEffect(() => {
    if (user?.role !== "block_chair" && form.block) {
      axios
        .get(`https://rice-scheme-system-1.onrender.com/farmers/sections/?block_id=${form.block}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .then((res) => {
          setSections(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch sections", err);
        });
    }
  }, [form.block, authToken, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRadioChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = { ...form };
      await axios.post("https://rice-scheme-system-1.onrender.com/attendance/", payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      Swal.fire("Success", "Attendance saved!", "success");

      setForm((prev) => ({
        ...initialForm,
        block: user?.role === "block_chair" ? user.block : "",
        section: user?.role === "block_chair" ? user.section : "",
      }));

      onSaved?.();
    } catch (err) {
      let errorMsg = "Error saving attendance";
      if (err.response?.data) {
        errorMsg = Object.entries(err.response.data)
          .map(([key, val]) => `${key}: ${val}`)
          .join("\n");
      }
      Swal.fire("Error", errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredFarmers = farmers
    .filter((f) => {
      const fullName = `${f.first_name} ${f.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });

  return (
    <div className="attendance-form-container">
      <div className="attendance-card">
        <div className="attendance-card-header">
          <h2>Record Attendance</h2>
          <p className="subtitle">Track farmer participation in various activities</p>
        </div>

        <div className="attendance-card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {user?.role !== "block_chair" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Block</label>
                    <select
                      name="block"
                      value={form.block}
                      onChange={handleChange}
                      required
                      className="form-select"
                    >
                      <option value="">-- Select Block --</option>
                      {blocks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Section</label>
                    <select
                      name="section"
                      value={form.section}
                      onChange={handleChange}
                      required
                      className="form-select"
                      disabled={!form.block}
                    >
                      <option value="">-- Select Section --</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="form-group full-width">
                <label className="form-label">Search Farmer</label>
                <input
                  type="text"
                  placeholder="Search farmer..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!form.block || !form.section}
                />
                <select
                  name="farmer"
                  value={form.farmer}
                  onChange={handleChange}
                  required
                  disabled={!form.block || !form.section}
                  className="form-select"
                >
                  <option value="">-- Select Farmer --</option>
                  {filteredFarmers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.first_name} {f.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Activity Type</label>
                <div className="radio-group-container">
                  {activityTypes.map((type) => (
                    <label key={type.id} className="radio-label">
                      <input
                        type="radio"
                        name="attendance_type"
                        checked={form.attendance_type === type.id}
                        onChange={() => handleRadioChange("attendance_type", type.id)}
                        className="radio-input"
                      />
                      <span className="radio-custom"></span>
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Status</label>
                <div className="radio-group-container status-radio">
                  {statusOptions.map((status) => (
                    <label key={status.id} className="radio-label">
                      <input
                        type="radio"
                        name="status"
                        checked={form.status === status.id}
                        onChange={() => handleRadioChange("status", status.id)}
                        className="radio-input"
                      />
                      <span className="radio-custom"></span>
                      {status.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Notes</label>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Additional comments..."
                  className="form-textarea"
                />
              </div>

              {form.status === "absent" && (
                <div className="form-group">
                  <label className="form-label">Penalty Points</label>
                  <input
                    type="number"
                    name="penalty_points"
                    value={form.penalty_points}
                    onChange={handleChange}
                    min="0"
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-actions full-width">
                <button type="submit" className="submit-button" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Attendance"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
