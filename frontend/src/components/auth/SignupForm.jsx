import { Eye, EyeOff, Lock, Mail, MapPin, User } from "lucide-react";

export default function SignupForm({
  signupForm,
  handleSignupChange,
  handleSignupSubmit,
  showSignupPassword,
  setShowSignupPassword,
  setActiveTab,
}) {
  return (
    <form onSubmit={handleSignupSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-left text-sm font-semibold text-slate-700">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="name"
              value={signupForm.name}
              onChange={handleSignupChange}
              placeholder="Full name"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-black outline-none transition focus:border-[#003B95] focus:ring-4 focus:ring-[#003B95]/10"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-left text-sm font-semibold text-slate-700">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="username"
              value={signupForm.username}
              onChange={handleSignupChange}
              placeholder="Create username"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-black outline-none transition focus:border-[#003B95] focus:ring-4 focus:ring-[#003B95]/10"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-left text-sm font-semibold text-slate-700">
          Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="address"
            value={signupForm.address}
            onChange={handleSignupChange}
            placeholder="Enter your address"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-black outline-none transition focus:border-[#003B95] focus:ring-4 focus:ring-[#003B95]/10"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-left text-sm font-semibold text-slate-700">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              name="email"
              value={signupForm.email}
              onChange={handleSignupChange}
              placeholder="Email address"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-black outline-none transition focus:border-[#003B95] focus:ring-4 focus:ring-[#003B95]/10"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-left text-sm font-semibold text-slate-700">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showSignupPassword ? "text" : "password"}
              name="password"
              value={signupForm.password}
              onChange={handleSignupChange}
              placeholder="Create password"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-black outline-none transition focus:border-[#003B95] focus:ring-4 focus:ring-[#003B95]/10"
            />
            <button
              type="button"
              onClick={() => setShowSignupPassword(!showSignupPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#003B95]"
            >
              {showSignupPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="mt-3 w-full rounded-2xl bg-[#003B95] px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#002766]"
      >
        Create Account
      </button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setActiveTab("login")}
          className="font-semibold text-[#003B95] hover:underline"
        >
          Login
        </button>
      </p>
    </form>
  );
}