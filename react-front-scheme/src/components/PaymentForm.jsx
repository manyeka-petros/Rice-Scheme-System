import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { useAuth } from "../components/AuthContext";
import "./PaymentForm.css";

const emptyForm = {
  farmer_id: "",
  total_amount: 0,
  amount: "",
  payment_type: "plot_fee",
  description: "",
  date_paid: format(new Date(), "yyyy-MM-dd"),
  method: "cash",
  reference_code: "",
  attachment: null,
};

export default function PaymentForm({ onSaved }) {
  const { authToken, user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        let url = "http://localhost:8000/farmers/farmers/";
        if (user?.role === "block_chair") {
          url += `?block=${user.block}`;
        }
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        // Ensure farmers is always an array (handle paginated or normal response)
        const farmersData = Array.isArray(res.data) ? res.data : res.data.results || [];
        setFarmers(farmersData);
      } catch (err) {
        Swal.fire("Error", "Failed to load farmers", "error");
        console.error(err);
      }
    };
    if (authToken) fetchFarmers();
  }, [authToken, user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newVal = files ? files[0] : value;

    setForm((prev) => {
      const updated = { ...prev, [name]: newVal };

      if (name === "farmer_id") {
        const f = farmers.find((f) => f.id === parseInt(value));
        updated.total_amount = f ? f.total_amount : 0;
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.farmer_id || !form.amount) {
      return Swal.fire("Validation", "Farmer and amount are required", "warning");
    }

    setSaving(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null && val !== "") formData.append(key, val);
    });

    try {
      await axios.post("http://localhost:8000/payments/", formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      Swal.fire("Success", "Payment recorded successfully", "success");
      setForm(emptyForm);
      onSaved?.();
    } catch (err) {
      let msg = "Error saving payment";
      if (err.response?.data) {
        msg = Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n");
      }
      Swal.fire("Error", msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="payment-form-container">
      <div className="payment-card">
        <div className="payment-card-header">
          <h2>Record Payment</h2>
          <p>Enter payment details for farmers</p>
        </div>

        <div className="payment-card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Farmer Selector */}
              <div className="form-group">
                <label>Farmer *</label>
                <select
                  name="farmer_id"
                  value={form.farmer_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Farmer --</option>
                  {Array.isArray(farmers) &&
                    farmers.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.first_name} {f.last_name} ({f.block?.name}-{f.section?.name})
                      </option>
                    ))}
                </select>
              </div>

              {/* Total Due */}
              <div className="form-group">
                <label>Total Due (MWK)</label>
                <div className="total-due-display">
                  {form.total_amount.toLocaleString()}
                </div>
              </div>

              {/* Payment Type */}
              <div className="form-group">
                <label>Payment Type *</label>
                <select
                  name="payment_type"
                  value={form.payment_type}
                  onChange={handleChange}
                  required
                >
                  <option value="plot_fee">Plot Fee</option>
                  <option value="fine">Fine</option>
                  <option value="contribution">Scheme Contribution</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Amount */}
              <div className="form-group">
                <label>Amount (MWK) *</label>
                <div className="amount-input">
                  <span className="currency">MK</span>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Date Paid */}
              <div className="form-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  name="date_paid"
                  value={form.date_paid}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Method */}
              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  name="method"
                  value={form.method}
                  onChange={handleChange}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="airtel">Airtel Money</option>
                  <option value="tnm">TNM Mpamba</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Reference Code */}
              <div className="form-group full-width">
                <label>Reference Code</label>
                <input
                  type="text"
                  name="reference_code"
                  value={form.reference_code}
                  onChange={handleChange}
                  placeholder="Transaction ID or receipt #"
                />
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label>Description *</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Purpose of payment"
                  required
                />
              </div>

              {/* Attachment */}
              <div className="form-group full-width">
                <label>Receipt (optional)</label>
                <div className="file-upload">
                  <label className="file-upload-label">
                    {form.attachment?.name || "Choose file..."}
                    <input
                      type="file"
                      name="attachment"
                      onChange={handleChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions full-width">
                <button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    "Record Payment"
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
