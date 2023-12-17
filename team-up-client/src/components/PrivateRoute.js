import { Navigate, Outlet } from "react-router-dom";
import React, { useContext } from "react";
import { AuthContext } from "../firebase/Auth";

const PrivateRoute = () => {
  const { currentUser } = useContext(AuthContext);
  // If authorized, return an outlet that will render child elements
  // If not, return element that will navigate to login page
  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
