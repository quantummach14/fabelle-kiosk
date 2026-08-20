import React from "react";
import { Navigate } from "react-router-dom";

const ADMIN_ROLES = ["seller", "admin", "super_admin"];

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let role: string | undefined;
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    role = userInfo?.role;
  } catch (err) {
    role = undefined;
  }

  if (!role || !ADMIN_ROLES.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
