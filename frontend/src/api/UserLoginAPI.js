const BASE_URL = "/api/users";

// User Registration API
export const registerUser = async (name, address, email, password, username) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, address, email, password, username })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

export const loginUser = async (username, password) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  // 🔥 Handle rate limit specifically
  if (res.status === 429) {
    throw new Error(data.message || "Too many login attempts");
  }

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

// User logout API
export const logoutUser = async () => {
  const res = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
};

// Get the current logged in user
export const getCurrentUser = async () => {
  const res = await fetch(`${BASE_URL}/me`, {
    method: "GET",
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Unauthorized");
  }

  return data;
};