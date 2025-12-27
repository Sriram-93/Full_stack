import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const syncAuthFromStorage = () => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const user = localStorage.getItem("user");

    setIsLoggedIn(loggedIn);
    if (loggedIn && user) {
      try {
        const u = JSON.parse(user);
        setUserName(u.name || "User");
      } catch {
        setUserName("User");
      }
    } else {
      setUserName("");
    }
  };

  useEffect(() => {
    syncAuthFromStorage();

    const onStorage = () => syncAuthFromStorage();
    const onUserLoggedIn = () => syncAuthFromStorage();

    window.addEventListener("storage", onStorage);
    window.addEventListener("userLoggedIn", onUserLoggedIn);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("userLoggedIn", onUserLoggedIn);
    };
  }, []);

  useEffect(() => {
    syncAuthFromStorage();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    syncAuthFromStorage();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          DevBlog
        </Link>

        {/* NEW NAV LINKS */}
        <div className="navbar-links">
          <Link to="/home">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {isLoggedIn && <Link to="/savedposts">Saved</Link>}
          {isLoggedIn && <Link to="/addblog">Write</Link>}
        </div>

        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              <span className="user-greeting">Hey, {userName}!</span>
              <button onClick={handleLogout} className="btn-logout" type="button">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
