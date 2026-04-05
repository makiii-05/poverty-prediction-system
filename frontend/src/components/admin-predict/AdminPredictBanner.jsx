import { Sparkles } from "lucide-react";

export default function AdminPredictBanner() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0056d2] px-6 py-6 text-white shadow-md sm:px-8 sm:py-7">
      
      {/* CONTENT */}
      <div className="flex items-start gap-4">

        {/* ICON */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
          <Sparkles className="h-7 w-7 text-white" />
        </div>

        {/* TEXT */}
        <div className="max-w-5xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Admin Prediction
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
            Upload an Excel or CSV dataset, predict poverty levels for all
            rows, review the results, and save them to the database when ready.
          </p>
        </div>

      </div>

      {/* DECORATIVE BLUR (same style as dashboard) */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}