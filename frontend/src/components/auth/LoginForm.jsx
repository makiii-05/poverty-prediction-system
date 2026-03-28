import { Eye, EyeOff, Lock, User } from "lucide-react";
import LoginSecurityNotice from "./LoginSecurityNotice";

export default function LoginForm({
  loginForm,
  handleLoginChange,
  handleLoginSubmit,
  showLoginPassword,
  setShowLoginPassword,
  attempts,
  attemptsLeft,
  locked,
  timer,
  progressWidth,
  maxAttempts,
  setActiveTab,
}) {
  return (
    <form onSubmit={handleLoginSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-left text-sm font-semibold text-slate-700">
          Username
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="username"
            value={loginForm.username}
            onChange={handleLoginChange}
            placeholder="Enter your username"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-black outline-none transition focus:border-[#003B95] focus:ring-4 focus:ring-[#003B95]/10"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-left text-sm font-semibold text-slate-700">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type={showLoginPassword ? "text" : "password"}
            name="password"
            value={loginForm.password}
            onChange={handleLoginChange}
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-black outline-none transition focus:border-[#003B95] focus:ring-4 focus:ring-[#003B95]/10"
          />
          <button
            type="button"
            onClick={() => setShowLoginPassword(!showLoginPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#003B95]"
          >
            {showLoginPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <LoginSecurityNotice
          attempts={attempts}
          attemptsLeft={attemptsLeft}
          locked={locked}
          timer={timer}
          progressWidth={progressWidth}
          maxAttempts={maxAttempts}
        />
      </div>

      <div className="text-right">
        <button
          type="button"
          className="text-sm font-medium text-[#003B95] transition hover:underline"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={locked}
        className={`w-full rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-md transition ${
          locked
            ? "cursor-not-allowed bg-slate-400"
            : "bg-[#003B95] hover:bg-[#002766]"
        }`}
      >
        {locked ? `Try again in ${timer}s` : "Login"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Don’t have an account?{" "}
        <button
          type="button"
          onClick={() => setActiveTab("signup")}
          className="font-semibold text-[#003B95] hover:underline"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}