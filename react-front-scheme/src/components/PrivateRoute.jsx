// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext"; // better to use useAuth hook

export default function PrivateRoute({ children }) {
  const { authToken } = useAuth(); // use the correct key

  return authToken ? children : <Navigate to="/login" replace />;
}
