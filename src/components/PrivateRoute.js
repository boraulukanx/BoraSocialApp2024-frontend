import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// PrivateRoute Component
const PrivateRoute = () => {
  const isAuthenticated = !!localStorage.getItem("token"); // Check if token exists

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
