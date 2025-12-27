import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "user";

  const handleLogout = () => {
    localStorage.removeItem("isAuth");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  const users = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInUsers") || "[]");
    } catch {
      return [];
    }
  }, []);

  const isAdmin = role === "admin";

  return (
    <div className="dashboard-layout">
      <header className="topbar">
        <div className="topbar-left">
          <span className="logo-dot" />
          <span className="topbar-title">Multiuser Dashboard</span>
        </div>
        <div className="topbar-right">
          <span className={isAdmin ? "badge badge-admin" : "badge badge-user"}>
            {role}
          </span>
          <button className="ghost-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-card">
          <h2>Welcome, {username}</h2>
          <p className="muted">
            {isAdmin
              ? "You are an admin. You can see all login activity below."
              : "You are a user. You only see your own information."}
          </p>

          <div className="stats-grid">
            <div className="stat-tile">
              <span className="stat-label">Role</span>
              <span className="stat-value">
                {isAdmin ? "Admin" : "User"}
              </span>
            </div>
            <div className="stat-tile">
              <span className="stat-label">Last login</span>
              <span className="stat-value">Just now</span>
            </div>
          </div>
        </section>

        {isAdmin && (
          <section className="dashboard-card" style={{ marginTop: 16 }}>
            <h3 style={{ margin: 0, marginBottom: 6 }}>Login activity</h3>
            <p className="muted">
              List of users who have logged in on this browser.
            </p>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={3} className="muted">
                        No login activity yet.
                      </td>
                    </tr>
                  )}
                  {users.map((u, idx) => (
                    <tr key={idx}>
                      <td>{u.username}</td>
                      <td>
                        <span
                          className={
                            u.role === "admin"
                              ? "badge badge-admin"
                              : "badge badge-user"
                          }
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>{new Date(u.time).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;


