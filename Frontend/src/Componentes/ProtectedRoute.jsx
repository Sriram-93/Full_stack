import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null); 

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          method: "GET",
          credentials: "include", 
        });

        if (res.ok) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch (error) {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);
  if (isAuth === null) {
    return <div className="loader">Verifying session...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
