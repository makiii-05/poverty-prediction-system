import { BarChart3 } from "lucide-react";

export default function LandingNavbar({ onLogin, scrollToSection }) {
  const navItems = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Features", id: "features" },
    { label: "Insights", id: "insights" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#003B95] text-white shadow-[0_10px_25px_rgba(0,59,149,0.18)]">
            <BarChart3 className="h-5 w-5" />
          </div>

          <div className="leading-tight">
            <h1 className="text-lg font-bold text-[#003B95]">PLPS - PH</h1>
            <p className="text-xs text-slate-500">
              Poverty Level Prediction System
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-sm font-semibold text-slate-600 transition hover:text-[#003B95]"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={onLogin}
          className="rounded-full bg-[#003B95] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002d73]"
        >
          Login
        </button>
      </div>
    </header>
  );
}