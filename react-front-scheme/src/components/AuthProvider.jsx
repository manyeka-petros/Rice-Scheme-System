import React, { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (credentials) => {
    try {
      const res = await axios.post("http://localhost:8000/accounts/login/", credentials);
      localStorage.setItem("user", JSON.stringify(res.data));
      localStorage.setItem("access", res.data.access);
      setUser(res.data);
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    setUser(null);
  };

  // Function to get headers when making requests
  const getAuthHeader = () => {
    const token = localStorage.getItem("access");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
};
