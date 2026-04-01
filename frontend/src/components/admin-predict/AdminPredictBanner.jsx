import { Sparkles } from "lucide-react";

export default function AdminPredictBanner() {
  return (
    <div className="mb-6 rounded-[24px] bg-[#003B95] px-6 py-6 text-white shadow-[0_10px_24px_rgba(15,23,42,0.10)] sm:px-8 sm:py-7">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/12 p-4">
          <Sparkles className="h-7 w-7 text-white" />
        </div>

        <div className="max-w-5xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Admin Prediction
          </h1>
          <p className="mt-2 text-sm leading-7 text-white/95 sm:text-base">
            Upload an Excel or CSV dataset, predict poverty levels for all
            rows, review the results, and save them to the database when
            ready.
          </p>
        </div>
      </div>
    </div>
  );
}