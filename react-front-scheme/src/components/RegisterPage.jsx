import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "./RegisterPage.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.first_name.trim()) newErrors.first_name = "Required field";
    if (!form.last_name.trim()) newErrors.last_name = "Required field";
    if (!form.username.trim()) newErrors.username = "Required field";
    if (!form.email.trim()) newErrors.email = "Required field";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.password) newErrors.password = "Required field";
    else if (form.password.length < 8) newErrors.password = "Min 8 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      await axios.post("https://rice-scheme-system-1.onrender.com/accounts/register/", form);
      Swal.fire({
        title: "Welcome!",
        text: "Your account has been created successfully",
        icon: "success",
        confirmButtonColor: "#4CAF50",
        background: "#f8f9fa",
        backdrop: `
          rgba(0,0,0,0.4)
          url("/images/nyan-cat.gif")
          left top
          no-repeat
        `
      }).then(() => navigate("/login"));
    } catch (err) {
      let errorMessage = "Registration failed. Please try again.";
      if (err.response?.data) {
        if (typeof err.response.data === "object") {
          const apiErrors = {};
          for (const key in err.response.data) {
            apiErrors[key] = err.response.data[key].join(" ");
          }
          setErrors(apiErrors);
          errorMessage = "Please correct the errors";
        } else {
          errorMessage = err.response.data;
        }
      }
      Swal.fire({
        title: "Oops!",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#F44336",
        background: "#f8f9fa"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="card-header">
            <h1>Create Account</h1>
            <p>Join our community today</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="name-fields">
              <div className={`form-group ${errors.first_name ? "error" : ""}`}>
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="John"
                />
                {errors.first_name && <span className="error-text">{errors.first_name}</span>}
              </div>

              <div className={`form-group ${errors.last_name ? "error" : ""}`}>
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                />
                {errors.last_name && <span className="error-text">{errors.last_name}</span>}
              </div>
            </div>

            <div className={`form-group ${errors.username ? "error" : ""}`}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="johndoe123"
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className={`form-group ${errors.email ? "error" : ""}`}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className={`form-group ${errors.password ? "error" : ""}`}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loader"></span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="login-redirect">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}