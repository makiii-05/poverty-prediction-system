export default function Footer() {
  return (
    <footer className="border-t border-[#003B95]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-center md:flex-row md:text-left">
            
            {/* Left */}
            <div>
            <h4 className="text-base font-semibold text-[#003B95]">
                PLPS – PH
            </h4>
            <p className="text-sm text-slate-500">
                Poverty Level Prediction System
            </p>
            </div>

            {/* Right */}
            <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} PLPS – PH. All rights reserved.
            </div>

        </div>
        </footer>
  );
}