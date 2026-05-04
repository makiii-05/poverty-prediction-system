import { useEffect, useState } from "react";
import { X, UserPlus } from "lucide-react";
import ConfirmModal from "../common/ConfirmModal"; // adjust path if needed

const INITIAL_FORM = {
  name: "",
  address: "",
  username: "",
  email: "",
  password: "",
  role: "user",
};

export default function AddUserModal({
  open,
  loading = false,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setModalError("");
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setModalError("");

    // Required fields
    if (
      !form.name.trim() ||
      !form.address.trim() ||
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      setModalError("All fields are required.");
      return;
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(form.password)) {
      setModalError(
        "Password must be at least 8 characters, include 1 uppercase, 1 lowercase, and 1 special character."
      );
      return;
    }

    // Submit
    onSave({
      name: form.name.trim(),
      address: form.address.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });
  };

  return (
    <>
      {/* MAIN MODAL */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
          
          {/* HEADER */}
          <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <UserPlus className="h-5 w-5 text-[#003B95]" />
                Add User
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Create a new account for the system.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              
              {/* NAME */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
                />
              </div>

              {/* ADDRESS */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
                />
              </div>

              {/* USERNAME */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
                />
              </div>

              {/* ROLE */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Role
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* EMAIL */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
                />
              </div>

              {/* PASSWORD */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Must be 8 characters with uppercase, lowercase, and special character.
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#003B95] px-4 py-2.5 text-sm text-white hover:bg-[#002f7a]"
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ REUSABLE MODAL (YOUR ConfirmModal) */}
      <ConfirmModal
        isOpen={!!modalError}
        message={modalError}
        confirmText="OK"
        onConfirm={() => setModalError("")}
        onCancel={() => setModalError("")} // not used but required
      />
    </>
  );
}