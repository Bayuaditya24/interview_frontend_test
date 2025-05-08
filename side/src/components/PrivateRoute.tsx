import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const token = useSelector((state: RootState) => state.auth.token);

  // Jika token tidak ada, alihkan ke halaman login
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;

export {};
