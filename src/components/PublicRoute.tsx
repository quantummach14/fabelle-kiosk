import React from 'react';
import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token'); // or from context/store

  if (isAuthenticated) {
    return <Navigate to="/home" replace />; // or `/dashboard`, wherever you want to redirect
  }

  return <>{children}</>;
};
