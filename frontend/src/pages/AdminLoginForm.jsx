import { useState } from "react";
import { Shield } from "lucide-react";
import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";
import FullscreenLoader from "../components/common/Loader";
import ConfirmModal from "../components/common/ConfirmModal";

import { loginUser } from "../api/UserLoginAPI";

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  // 🔥 modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await loginUser(form.username, form.password);

      console.log("Login success:", data);

      // ROLE CHECK
      if (data.user.role !== "admin") {
        setModalMessage("Access denied. Admin account required.");
        setModalOpen(true);
        return;
      }

      // Redirect
      window.location.href = "/admin/dashboard";
    } catch (error) {
      setModalMessage(error.message || "Login failed");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <FullscreenLoader text="Processing..." />}

      <div className="min-h-screen flex items-center justify-center bg-[#003B95] px-4">
        <div className="w-full max-w-[420px] rounded-2xl bg-[#F4F4F4] px-8 py-8 shadow-lg">
          {/* Header */}
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#002F7A]">
              <Shield className="h-7 w-7 text-white" />
            </div>

            <h1 className="text-xl font-semibold text-[#002F7A] text-center">
              Poverty Level Prediction System
            </h1>

            <p className="mt-1 text-sm text-slate-600 text-center">
              A Machine learning-based Poverty Level Prediction
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="h-11 w-full rounded-lg border border-slate-300 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95]/30"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="h-11 w-full rounded-lg border border-slate-300 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B95]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <img
                    src={showPassword ? hideIcon : viewIcon}
                    alt="toggle password"
                    className="w-5 h-5 cursor-pointer opacity-60 hover:opacity-100 transition"
                  />
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-xs text-[#003B95] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-[#002F7A] text-white text-sm font-semibold hover:bg-[#002766] transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>

      {/* ✅ Confirm Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        message={modalMessage}
        onConfirm={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        confirmText="OK"
        cancelText="Close"
      />
    </>
  );
}