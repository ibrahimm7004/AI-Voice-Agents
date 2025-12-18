import { useAppSelector } from "../hooks/useAppDispatch";
import { Navigate } from "react-router-dom";
import React from "react";

interface PublicRouteProps {
  element: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ element }) => {
  const { currentUser } = useAppSelector((state) => state.auth);

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return <>{element}</>;
};

export default PublicRoute;
