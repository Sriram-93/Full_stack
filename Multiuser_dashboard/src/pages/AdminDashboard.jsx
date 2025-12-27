import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";
  const role = localStorage.getItem("role") || "admin";

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

  return (
    <div className="dashboard-layout">
      <header className="topbar">
        <div className="topbar-left">
          <span className="logo-dot" />
          <span className="topbar-title">Multiuser Dashboard</span>
        </div>
        <div className="topbar-right">
          <span className="badge badge-soft badge-admin">{role}</span>
          <button className="ghost-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-card">
          <h2>Welcome, {username}</h2>
          <p className="muted">
            You are an admin. You can see who logged in and what role they
            selected.
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
      </main>
    </div>
  );
}

export default AdminDashboard;


