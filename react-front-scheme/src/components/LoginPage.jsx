import React, { useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../components/AuthContext";
import "./LoginPage.css";

// Constants
const API_BASE_URL = "https://rice-scheme-system.onrender.com";
const LOGIN_ENDPOINT = `${API_BASE_URL}/accounts/login/`;

const ACCESS_TOKEN_KEY = "access";
const REFRESH_TOKEN_KEY = "refresh";
const USER_DATA_KEY = "user";

// ...imports unchanged

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.username.trim() || !form.password) {
      Swal.fire("Error", "Please fill in all fields", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(LOGIN_ENDPOINT, form, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      const { access, refresh, user } = response.data;

      // Store tokens and user in localStorage
      localStorage.setItem(ACCESS_TOKEN_KEY, access);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));

      login({ token: access, user });

      // 🌐 Redirect based on user role
      let redirectPath = "/dashboard"; // default for admin, president, secretary
      if (user.role === "block_chair") {
        redirectPath = "/blockchair-dashboard";
      } else if (user.role === "treasurer") {
        redirectPath = "/treasurer-dashboard";
      }

      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      handleLoginError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (err) => {
    let errorMessage = "Login failed. Please try again.";

    if (err.response) {
      switch (err.response.status) {
        case 400:
          errorMessage = "Invalid request data.";
          break;
        case 401:
          errorMessage = "Invalid credentials.";
          break;
        case 403:
          errorMessage = "Account not approved.";
          break;
        case 429:
          errorMessage = "Too many attempts.";
          break;
        case 500:
          errorMessage = "Server error.";
          break;
        default:
          errorMessage = err.response.data?.detail || errorMessage;
      }
    } else if (err.request) {
      errorMessage = "No server response.";
    } else if (err.code === "ECONNABORTED") {
      errorMessage = "Request timeout.";
    } else {
      errorMessage = err.message || errorMessage;
    }

    Swal.fire({
      icon: "error",
      title: "Login Error",
      text: errorMessage,
      confirmButtonColor: "#2e7d32",
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              autoFocus
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? <span className="spinner"></span> : "Sign In"}
          </button>

          <div className="create-account-link">
            <span>Don't have an account?</span>
            <Link to="/register">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
