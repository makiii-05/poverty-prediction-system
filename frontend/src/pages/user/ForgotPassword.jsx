import { useState } from "react";
import { Mail, ShieldCheck, KeyRound, ArrowLeft } from "lucide-react";
import {
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
} from "../../api/ForgotPasswordAPI";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);
      const data = await forgotPassword(email.trim());
      setMessage(data.message || "OTP sent successfully.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!otp.trim()) {
      setError("OTP is required.");
      return;
    }

    try {
      setLoading(true);
      const data = await verifyForgotPasswordOtp(email.trim(), otp.trim());
      setMessage(data.message || "OTP verified successfully.");
      setStep(3);
    } catch (err) {
      setError(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const data = await resetPassword(
        email.trim(),
        otp.trim(),
        newPassword.trim()
      );

      setMessage(data.message || "Password reset successful.");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#003B95]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#003B95]/10">
              {step === 1 && <Mail className="h-7 w-7 text-[#003B95]" />}
              {step === 2 && (
                <ShieldCheck className="h-7 w-7 text-[#003B95]" />
              )}
              {step === 3 && <KeyRound className="h-7 w-7 text-[#003B95]" />}
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Forgot Password
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {step === 1 && "Enter your email to receive a one-time PIN."}
              {step === 2 && "Enter the OTP sent to your Gmail."}
              {step === 3 && "Create your new password."}
            </p>
          </div>

          <div className="mb-6 flex items-center justify-center gap-2">
            <div
              className={`h-2 w-16 rounded-full ${
                step >= 1 ? "bg-[#003B95]" : "bg-slate-200"
              }`}
            />
            <div
              className={`h-2 w-16 rounded-full ${
                step >= 2 ? "bg-[#003B95]" : "bg-slate-200"
              }`}
            />
            <div
              className={`h-2 w-16 rounded-full ${
                step >= 3 ? "bg-[#003B95]" : "bg-slate-200"
              }`}
            />
          </div>

          {message && (
            <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Gmail Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#003B95] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#002d73] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  One-Time PIN
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setStep(1);
                  }}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#003B95] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#002d73] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setStep(2);
                  }}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#003B95] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#002d73] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#003B95] transition hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}