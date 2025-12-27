import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const trimmedName = username.trim();
    if (!trimmedName || !password) {
      setError("Name and password are required.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const found = users.find(
      (u) =>
        u.username.toLowerCase() === trimmedName.toLowerCase() &&
        u.password === password
    );

    if (!found) {
      setError("Invalid credentials or user not registered.");
      return;
    }

    const role = found.role;

    localStorage.setItem("isAuth", "true");
    localStorage.setItem("username", trimmedName);
    localStorage.setItem("role", role);

    // Track simple "who logged in" list for admin view
    const existing = JSON.parse(localStorage.getItem("loggedInUsers") || "[]");
    const updated = [
      ...existing,
      {
        username: trimmedName,
        role,
        time: new Date().toISOString(),
      },
    ];
    localStorage.setItem("loggedInUsers", JSON.stringify(updated));

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1 className="app-title">Login</h1>
        <p className="app-subtitle">Use your registered account</p>

        {error && <div className="error-banner">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-username">Name</label>
            <input
              id="login-username"
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="primary-btn" type="submit">
            Login
          </button>
        </form>

        <p className="hint-text">
          New here?{" "}
          <Link to="/register" className="inline-link">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;


