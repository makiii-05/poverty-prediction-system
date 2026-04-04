import { useState } from "react";
import { X } from "lucide-react";
import FullscreenLoader from "../common/Loader";
import ConfirmModal from "../common/ConfirmModal";
import AuthLeftPanel from "./AuthLeftPanel";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { registerUser, loginUser } from "../../api/UserLoginAPI";

export default function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openModal, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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

  if (!isOpen) return null;

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
    setLoading(true);

    try {
      const data = await loginUser(loginForm.username, loginForm.password);

      setLoginForm({
        username: "",
        password: "",
      });

      onClose();

      if (data.user.role !== "user") {
        window.location.href = "/unauthorized";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setModalMessage(error.message || "Login failed");
      setModalOpen(true);
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

      setModalMessage("Account created successfully. You can now log in.");
      setModalOpen(true);
    } catch (error) {
      setModalMessage(error.message || "Signup failed");
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

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
            <AuthLeftPanel />

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
                  <LoginForm
                    loginForm={loginForm}
                    handleLoginChange={handleLoginChange}
                    handleLoginSubmit={handleLoginSubmit}
                    showLoginPassword={showLoginPassword}
                    setShowLoginPassword={setShowLoginPassword}
                    setActiveTab={setActiveTab}
                  />
                ) : (
                  <SignupForm
                    signupForm={signupForm}
                    handleSignupChange={handleSignupChange}
                    handleSignupSubmit={handleSignupSubmit}
                    showSignupPassword={showSignupPassword}
                    setShowSignupPassword={setShowSignupPassword}
                    setActiveTab={setActiveTab}
                  />
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