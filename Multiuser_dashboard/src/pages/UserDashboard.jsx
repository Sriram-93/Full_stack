import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "user";

  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-layout">
      <header className="topbar">
        <div className="topbar-left">
          <span className="logo-dot" />
          <span className="topbar-title">Multiuser Dashboard</span>
        </div>
        <div className="topbar-right">
          <span className="badge badge-soft">{role}</span>
          <button className="ghost-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-card">
          <h2>Welcome back, {username}</h2>
          <p className="muted">
            This is your personal dashboard. As a user you can only see your
            own information.
          </p>

          <div className="stats-grid">
            <div className="stat-tile">
              <span className="stat-label">Role</span>
              <span className="stat-value">User</span>
            </div>
            <div className="stat-tile">
              <span className="stat-label">Last login</span>
              <span className="stat-value">Just now</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;


