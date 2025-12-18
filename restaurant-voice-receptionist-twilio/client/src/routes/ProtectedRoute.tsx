import { useAppSelector } from "../hooks/useAppDispatch";
import { Navigate } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { currentUser } = useAppSelector((state) => state.auth);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{element}</>;
};

export default ProtectedRoute;
