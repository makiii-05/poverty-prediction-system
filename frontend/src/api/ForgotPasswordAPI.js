const BASE_URL = "/api/password";

export const forgotPassword = async (email) => {
  const res = await fetch(`${BASE_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to send OTP");
  }

  return data;
};

export const verifyForgotPasswordOtp = async (email, otp) => {
  const res = await fetch(`${BASE_URL}/verify-forgot-password-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, otp }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to verify OTP");
  }

  return data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const res = await fetch(`${BASE_URL}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, otp, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to reset password");
  }

  return data;
};