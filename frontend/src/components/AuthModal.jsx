import { useEffect, useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  User,
  Mail,
  MapPin,
  Lock,
  ShieldAlert,
  TimerReset,
} from "lucide-react";
import FullscreenLoader from "./Loader";
import ConfirmModal from "./ConfirmModal";

// API imports
import { registerUser, loginUser } from "../api/UserLoginAPI";

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;
const STORAGE_KEY = "plps_login_guard";

export default function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openModal, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [timer, setTimer] = useState(0);

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    address: "",
    email: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    const savedGuard = localStorage.getItem(STORAGE_KEY);

    if (!savedGuard) return;

    try {
      const parsed = JSON.parse(savedGuard);
      const now = Date.now();

      if (parsed.lockUntil && parsed.lockUntil > now) {
        const remainingSeconds = Math.ceil((parsed.lockUntil - now) / 1000);
        setAttempts(parsed.attempts || MAX_ATTEMPTS);
        setLocked(true);
        setTimer(remainingSeconds);
      } else {
        setAttempts(parsed.attempts || 0);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            attempts: parsed.lockUntil && parsed.lockUntil <= now ? 0 : parsed.attempts || 0,
            lockUntil: null,
          })
        );
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    let interval;

    if (locked && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setLocked(false);
            setAttempts(0);
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                attempts: 0,
                lockUntil: null,
              })
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [locked, timer]);

  if (!isOpen) return null;

  const saveGuardState = (nextAttempts, lockUntil = null) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        attempts: nextAttempts,
        lockUntil,
      })
    );
  };

  const resetGuardState = () => {
    setAttempts(0);
    setLocked(false);
    setTimer(0);
    saveGuardState(0, null);
  };

  const startLockTimer = (seconds, currentAttempts = MAX_ATTEMPTS) => {
    const lockUntil = Date.now() + seconds * 1000;

    setLocked(true);
    setTimer(seconds);
    setAttempts(currentAttempts);
    saveGuardState(currentAttempts, lockUntil);
  };

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignupChange = (e) => {
    setSignupForm({
      ...signupForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (locked) return;

    setLoading(true);

    try {
      const data = await loginUser(loginForm.username, loginForm.password);

      resetGuardState();

      setLoginForm({
        username: "",
        password: "",
      });

      onClose();

      if (data.user.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      const message = error.message || "Login failed";
      const nextAttempts = attempts + 1;

      if (message.toLowerCase().includes("too many")) {
        setModalMessage(message);
        setModalOpen(true);
        startLockTimer(LOCK_SECONDS, MAX_ATTEMPTS);
      } else if (nextAttempts >= MAX_ATTEMPTS) {
        setModalMessage(
          `Too many login attempts. Please wait ${LOCK_SECONDS} seconds before trying again.`
        );
        setModalOpen(true);
        startLockTimer(LOCK_SECONDS, nextAttempts);
      } else {
        setAttempts(nextAttempts);
        saveGuardState(nextAttempts, null);
        setModalMessage(message);
        setModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(
        signupForm.name,
        signupForm.address,
        signupForm.email,
        signupForm.password,
        signupForm.username
      );

      setActiveTab("login");

      setSignupForm({
        name: "",
        address: "",
        email: "",
        username: "",
        password: "",
      });
    } catch (error) {
      setModalMessage(error.message);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const attemptsLeft = Math.max(MAX_ATTEMPTS - attempts, 0);
  const progressWidth = `${(attempts / MAX_ATTEMPTS) * 100}%`;

  return (
    <>
      {loading && <FullscreenLoader text="Processing..." />}

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#001a42]/55 px-4 backdrop-blur-sm">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 z-20 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#003B95]"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid min-h-[680px] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#003B95] via-[#0047b3] to-[#002766] p-10 text-white lg:block">
              <div className="absolute left-[-50px] top-[-60px] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute bottom-[-50px] right-[-50px] h-64 w-64 rounded-full bg-white/10 blur-3xl" />

              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                    PLPS - PH
                  </div>

                  <h2 className="mt-8 text-4xl font-bold leading-tight">
                    Welcome to the
                    <span className="block">
                      Poverty Level Prediction System
                    </span>
                  </h2>

                  <p className="mt-5 max-w-md text-base leading-8 text-white/85">
                    Access the platform to explore regional poverty data, manage
                    your account, and interact with machine learning-based
                    poverty analysis tools in one secure system.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <p className="text-sm font-semibold">Secure Access</p>
                    <p className="mt-1 text-sm text-white/80">
                      User authentication for protected platform access.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                    <p className="text-sm font-semibold">User Registration</p>
                    <p className="mt-1 text-sm text-white/80">
                      Create a user account directly from the landing page.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center bg-white px-6 py-8 sm:px-10">
              <div className="w-full max-w-md">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#003B95]/70">
                    User Access
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-[#003B95]">
                    {activeTab === "login"
                      ? "Login to your account"
                      : "Create your account"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {activeTab === "login"
                      ? "Enter your credentials to continue to the platform."
                      : "Fill in your details to create a new user account."}
                  </p>
                </div>

                <div className="mb-6 grid grid-cols-2 rounded-2xl bg-[#f4f8ff] p-1">
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      activeTab === "login"
                        ? "bg-[#003B95] text-white shadow-md"
                        : "text-[#003B95] hover:bg-white"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setActiveTab("signup")}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      activeTab === "signup"
                        ? "bg-[#003B95] text-white shadow-md"
                        : "text-[#003B95] hover:bg-white"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {activeTab === "login" ? (
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
                          onClick={() =>
                            setShowLoginPassword(!showLoginPassword)
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#003B95]"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {(attempts > 0 || locked) && (
                        <div
                          className={`mt-3 rounded-2xl border p-3 ${
                            locked
                              ? "border-red-200 bg-red-50"
                              : "border-amber-200 bg-amber-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 rounded-full p-2 ${
                                locked
                                  ? "bg-red-100 text-red-600"
                                  : "bg-amber-100 text-amber-600"
                              }`}
                            >
                              {locked ? (
                                <ShieldAlert className="h-4 w-4" />
                              ) : (
                                <TimerReset className="h-4 w-4" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <p
                                  className={`text-sm font-semibold ${
                                    locked ? "text-red-700" : "text-amber-700"
                                  }`}
                                >
                                  {locked
                                    ? "Login temporarily locked"
                                    : "Login security notice"}
                                </p>

                                {!locked && (
                                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                                    {attempts}/{MAX_ATTEMPTS} attempts used
                                  </span>
                                )}
                              </div>

                              {locked ? (
                                <p className="mt-1 text-xs leading-5 text-red-600">
                                  Too many failed login attempts. Please wait{" "}
                                  <span className="font-semibold">
                                    {timer}s
                                  </span>{" "}
                                  before trying again.
                                </p>
                              ) : (
                                <p className="mt-1 text-xs leading-5 text-amber-700">
                                  You have{" "}
                                  <span className="font-semibold">
                                    {attemptsLeft}
                                  </span>{" "}
                                  login attempt
                                  {attemptsLeft !== 1 ? "s" : ""} remaining
                                  before temporary lock.
                                </p>
                              )}

                              {!locked && (
                                <>
                                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-amber-200">
                                    <div
                                      className="h-full rounded-full bg-amber-400 transition-all duration-300"
                                      style={{ width: progressWidth }}
                                    />
                                  </div>

                                  <div className="mt-2 flex justify-between text-[11px] text-amber-700">
                                    <span>Attempt progress</span>
                                    <span>{attemptsLeft} remaining</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
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
                ) : (
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
                            onClick={() =>
                              setShowSignupPassword(!showSignupPassword)
                            }
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={openModal}
        message={modalMessage}
        onCancel={() => setModalOpen(false)}
        onConfirm={() => setModalOpen(false)}
        confirmText="OK"
        cancelText="Cancel"
      />
    </>
  );
}