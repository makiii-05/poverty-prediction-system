export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-7 md:flex-row">
        <div>
          <h4 className="font-bold text-[#003B95]">PLPS - PH</h4>
          <p className="text-sm text-slate-500">
            Poverty Level Prediction System
          </p>
        </div>

        <div className="text-sm text-slate-500">
          © 2026 PLPS - PH. All rights reserved.
        </div>
      </div>
    </footer>
  );
}