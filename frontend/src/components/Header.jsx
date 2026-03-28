import { Shield, LogOut, Menu, Settings, ChevronDown } from "lucide-react";
import { getCurrentUser } from "../api/UserLoginAPI";
import { useEffect, useRef, useState } from "react";
import FullscreenLoader from "../components/Loader";
import ConfirmModal from "./ConfirmModal";

export default function Header({ onMenuClick }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (error) {
        window.location.href = "/unauthorized";
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onLogout = async () => {
    try {
      setLoading(true);

      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });

      // 👇 redirect based on role
      if (user?.role === "admin") {
        window.location.href = "/login/admin";
      } else {
        window.location.href = "/";
      }

    } catch (err) {
      setLoading(false);
      setModalMessage("Logout failed");
      setModalOpen(true);
    }
  };

  const userInitial =
    user?.username?.charAt(0)?.toUpperCase() ||
    user?.name?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <>
      {loading && <FullscreenLoader text="Processing..." />}

      <header className="w-full border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="rounded-lg p-1.5 text-slate-700 transition hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#003B95]">
              <Shield className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-[16px] font-semibold text-[#003B95]">
                PLPS - PH
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">
                Predictive Classification
              </p>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpenMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:bg-slate-50 sm:px-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#003B95] text-xs font-semibold text-white">
                {userInitial}
              </div>

              <div className="hidden text-right leading-tight lg:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.username || "Loading..."}
                </p>
                <p className="text-xs text-slate-500">{user?.role || ""}</p>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform ${
                  openMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {openMenu && (
              <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    window.location.href = "/settings";
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>

                <div className="h-px bg-slate-200"></div>

                <button
                  onClick={() => {
                    setOpenMenu(false);
                    setModalMessage("Are you sure you want to logout?");
                    setModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={openModal}
        message={modalMessage}
        confirmText="Yes"
        cancelText="Cancel"
        onCancel={() => setModalOpen(false)}
        onConfirm={() => {
          onLogout();
          setModalOpen(false);
        }}
      />
    </>
  );
}