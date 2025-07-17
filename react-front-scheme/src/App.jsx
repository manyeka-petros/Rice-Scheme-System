// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PaymentsPage from "./components/PaymentsPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AttendancePage from "./components/AttendancePage";
import DisciplinePage from "./components/DisciplinePage";
import FarmerPage from "./components/FarmerPage";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";
import HomePage from "./components/HomePage";
import PrivateRoute from "./components/PrivateRoute";
// ✅ Import your new dashboards
import BlockChairDashboard from "./components/BlockChairDashboard";
import TreasurerDashboard from "./components/TreasurerDashboard";
import DashboardPage from "./components/DashboardPage";

function App() {
  return (
    <>
      <Navbar />
      <div className="p-4">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/contactUs" element={<ContactUs />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/blockchair-dashboard"
            element={
              <PrivateRoute>
                <BlockChairDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/treasurer-dashboard"
            element={
              <PrivateRoute>
                <TreasurerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/farmers"
            element={
              <PrivateRoute>
                <FarmerPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <AttendancePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <PrivateRoute>
                <PaymentsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/discipline"
            element={
              <PrivateRoute>
                <DisciplinePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
