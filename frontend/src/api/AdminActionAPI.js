const BASE_URL = "/api/verify";

export const verifyAdminPassword = async (password) => {
  const res = await fetch(`${BASE_URL}/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Password verification failed");
  }

  return data;
};