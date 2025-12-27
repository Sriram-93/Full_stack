import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const isAuth = localStorage.getItem("isAuth") === "true";
  const role = localStorage.getItem("role"); // "user" or "admin"

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;


