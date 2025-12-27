const BASE_URL = "http://localhost:8080/api/users";

export const createUser = async (user) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
};

export const getAllUsers = async () => {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};
