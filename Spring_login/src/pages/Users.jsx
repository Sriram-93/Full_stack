import { useEffect, useState } from "react";
import { getAllUsers, createUser } from "../api/userApi";

const Users = () => {
  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  useEffect(() => {
    getAllUsers().then(setUsers).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !role) {
      alert("All fields are required");
      return;
    }

    const user = { name, email, password, role };

    try {
      const saved = await createUser(user);
      setUsers((prev) => [...prev, saved]);

      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>Add User</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Create User</button>
      </form>

      <hr />

      <h3>Users</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} — {u.email} — {u.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
