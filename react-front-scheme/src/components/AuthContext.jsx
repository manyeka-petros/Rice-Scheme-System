import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("access"));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refresh"));

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = ({ token, refresh, user }) => {
    setAuthToken(token);
    setRefreshToken(refresh);
    setUser(user);
    localStorage.setItem("access", token);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setAuthToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ authToken, refreshToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
