import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
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

    // Simple localStorage "database" of users
    const existing = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const already = existing.find(
      (u) => u.username.toLowerCase() === trimmedName.toLowerCase()
    );

    if (already) {
      setError("User already exists. Please login instead.");
      return;
    }

    const updated = [
      ...existing,
      {
        username: trimmedName,
        password,
        role,
      },
    ];

    localStorage.setItem("registeredUsers", JSON.stringify(updated));

    // After successful register, go to login
    navigate("/login", { replace: true });
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1 className="app-title">Create account</h1>
        <p className="app-subtitle">Register first, then login to dashboard</p>

        {error && <div className="error-banner">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="reg-username">Name</label>
            <input
              id="reg-username"
              type="text"
              placeholder="Choose a display name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="reg-role">Role</label>
            <select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="primary-btn" type="submit">
            Register
          </button>
        </form>

        <p className="hint-text">
          Already have an account?{" "}
          <Link to="/login" className="inline-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;


