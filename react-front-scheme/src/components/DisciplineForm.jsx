import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../components/AuthContext";
import "./DisciplineForm.css";

const emptyForm = {
  farmer_id: "",
  offence_type: "absence",
  offence_description: "",
  status: "open",
  severity: "moderate",
  penalty_points: 0,
  action_taken: "",
  comment: "",
  attachment: null,
  date_incident: new Date().toISOString().split("T")[0],
};

export default function DisciplineForm({ onSaved }) {
  const { authToken, user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let farmersUrl = "http://localhost:8000/farmers/farmers/";
        if (user?.role === "block_chair" && user.block) {
          farmersUrl += `?block=${user.block}`;
        }

        const farmersRes = await axios.get(farmersUrl, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        console.log("Fetched farmers:", farmersRes.data);
        setFarmers(farmersRes.data.results); // ✅ FIX: use paginated results array
      } catch (error) {
        Swal.fire("Error", "Failed to fetch farmers", "error");
        console.error(error);
      }
    };

    fetchData();
  }, [authToken, user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    for (const key in form) {
      if (form[key] !== null && form[key] !== "") {
        formData.append(key, form[key]);
      }
    }

    try {
      await axios.post("http://localhost:8000/discipline/", formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        title: "Case Recorded",
        text: "Discipline case has been submitted successfully",
        icon: "success",
        confirmButtonColor: "#ff4d4d",
      });
      setForm(emptyForm);
      onSaved?.();
    } catch (error) {
      let errorMsg = "Error saving case";
      if (error.response?.data) {
        errorMsg = Object.entries(error.response.data)
          .map(([key, val]) => `${key}: ${val}`)
          .join("\n");
      }
      Swal.fire({
        title: "Error",
        text: errorMsg,
        icon: "error",
        confirmButtonColor: "#ff4d4d",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="discipline-form-container">
      <div className="discipline-form-card">
        <div className="discipline-form-header">
          <h2>New Discipline Case</h2>
        </div>
        <div className="discipline-form-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label required">Farmer</label>
                <select
                  name="farmer_id"
                  value={form.farmer_id}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select farmer</option>
                  {Array.isArray(farmers) &&
                    farmers.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.first_name} {f.last_name}
                        {f.block_name ? ` (${f.block_name})` : ""}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Date</label>
                <input
                  type="date"
                  name="date_incident"
                  value={form.date_incident}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Offense Type</label>
                <select
                  name="offence_type"
                  value={form.offence_type}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="absence">Absence</option>
                  <option value="lateness">Lateness</option>
                  <option value="violence">Violence</option>
                  <option value="theft">Theft</option>
                  <option value="vandalism">Vandalism</option>
                  <option value="non_compliance">Non-compliance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Severity</label>
                <select
                  name="severity"
                  value={form.severity}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="serious">Serious</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label required">Description</label>
                <textarea
                  name="offence_description"
                  value={form.offence_description}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Describe the incident..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label required">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="hearing_scheduled">Hearing Scheduled</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Penalty Points</label>
                <input
                  type="number"
                  name="penalty_points"
                  value={form.penalty_points}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Action Taken</label>
                <input
                  name="action_taken"
                  value={form.action_taken}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="What action was taken?"
                />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Comments</label>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Attachment</label>
                <div className="file-upload-container">
                  <label className="file-upload-label">
                    {form.attachment ? form.attachment.name : "Click to upload file"}
                    <input
                      type="file"
                      name="attachment"
                      onChange={handleChange}
                      className="file-upload-input"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Case"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
