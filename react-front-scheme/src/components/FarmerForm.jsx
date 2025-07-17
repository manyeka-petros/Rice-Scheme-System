import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../components/AuthContext";
import "./FarmerForm.css";

const emptyForm = {
  first_name: "",
  last_name: "",
  middle_name: "",
  gender: "male",
  phone_number: "",
  email: "",
  number_of_plots: 1,
  amount_per_plot: 0,
  block_id: "",
  section_id: "",
  location_id: "",
  role: "farmer",
  next_of_kin: "",
  image: null,
};

export default function FarmerForm({ onSaved, editData, onCancel }) {
  const { authToken, user } = useAuth();
  const isAdminOrSecretary = user?.role === "admin" || user?.role === "secretary";

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (!authToken) return;

    if (editData) {
      setForm({ ...editData, image: null });
      if (editData.block_id || editData.block) {
        fetchSections(editData.block_id || editData.block);
      }
    } else {
      setForm(emptyForm);
      setSections([]);
    }

    fetchInitialData();
  }, [editData, authToken]);

  const fetchInitialData = async () => {
    try {
      const [locRes, blockRes] = await Promise.all([
        axios.get("http://localhost:8000/farmers/locations/", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        axios.get("http://localhost:8000/farmers/blocks/", {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);
      setLocations(locRes.data);
      setBlocks(blockRes.data);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      Swal.fire("Error", "Failed to load locations or blocks", "error");
    }
  };

  const fetchSections = async (blockId) => {
    if (!blockId) {
      setSections([]);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8000/farmers/sections/?block_id=${blockId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setSections(res.data);
    } catch (err) {
      console.error("Failed to fetch sections:", err);
      setSections([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlockChange = (e) => {
    const blockId = e.target.value;
    setForm((prev) => ({
      ...prev,
      block_id: blockId,
      section_id: "",
    }));
    fetchSections(blockId);
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const isValid = () => {
    return (
      form.first_name.trim() &&
      form.last_name.trim() &&
      form.phone_number.trim() &&
      form.number_of_plots >= 1 &&
      form.amount_per_plot > 0 &&
      form.block_id &&
      form.section_id &&
      form.location_id
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) {
      Swal.fire("Invalid", "Please fill all required fields correctly.", "warning");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      for (let key in form) {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      }

      formData.set("location", form.location_id);
      formData.set("block", form.block_id);
      formData.set("section", form.section_id);

      const url = form.id
        ? `http://localhost:8000/farmers/farmers/${form.id}/`
        : `http://localhost:8000/farmers/farmers/`;

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authToken}`,
        },
      };

      const res = form.id
        ? await axios.put(url, formData, config)
        : await axios.post(url, formData, config);

      Swal.fire("Success", "Farmer saved successfully.", "success");
      onSaved?.(res.data);
      setForm(emptyForm);
      setSections([]);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data
        ? Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("\n")
        : "Error saving farmer";
      Swal.fire("Error", msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = form.number_of_plots * form.amount_per_plot;

  return (
    <div className="farmer-form">
      <div className="form-card">
        <div className="form-header">
          <h2>{form.id ? "Edit Farmer" : "Register Farmer"}</h2>
        </div>
        <div className="form-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">

              <div className="form-group">
                <label>First Name</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Middle Name</label>
                <input name="middle_name" value={form.middle_name} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone_number" value={form.phone_number} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label>Number of Plots</label>
                <input type="number" name="number_of_plots" value={form.number_of_plots} onChange={handleChange} min="1" />
              </div>

              <div className="form-group">
                <label>Amount per Plot</label>
                <input type="number" name="amount_per_plot" value={form.amount_per_plot} onChange={handleChange} min="0" />
              </div>

              <div className="form-group">
                <label>Location</label>
                <select name="location_id" value={form.location_id} onChange={handleChange} required>
                  <option value="">-- Select Location --</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Block</label>
                <select name="block_id" value={form.block_id} onChange={handleBlockChange} required>
                  <option value="">-- Select Block --</option>
                  {blocks.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Section</label>
                <select name="section_id" value={form.section_id} onChange={handleChange} required>
                  <option value="">-- Select Section --</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Next of Kin</label>
                <input name="next_of_kin" value={form.next_of_kin} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Photo</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>

              <div className="form-group">
                <label>Total Amount</label>
                <div className="readonly-input">${totalAmount.toFixed(2)}</div>
              </div>
            </div>

            {isAdminOrSecretary && (
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving || !isValid()}>
                  {saving ? "Saving..." : form.id ? "Update Farmer" : "Save Farmer"}
                </button>
                {form.id && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setForm(emptyForm);
                      setSections([]);
                      onCancel?.();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
