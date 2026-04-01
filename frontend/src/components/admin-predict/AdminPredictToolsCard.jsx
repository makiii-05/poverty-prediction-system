import { History, BarChart3 } from "lucide-react";

export default function AdminPredictToolsCard({
  onShowResult,
  onShowHistory,
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-slate-900">
        Prediction Tools
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-500 sm:text-base">
        Open the prediction result and uploaded file history through the
        buttons below.
      </p>

      <div className="mt-6 rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-4">
        <button
          type="button"
          onClick={onShowResult}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#003B95]/40 hover:text-[#003B95]"
        >
          <BarChart3 className="h-4 w-4" />
          Predict Result
        </button>
      </div>

      <div className="mt-4 rounded-[20px] border border-dashed border-slate-300 bg-slate-50 p-4">
        <button
          type="button"
          onClick={onShowHistory}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#003B95]/40 hover:text-[#003B95]"
        >
          <History className="h-4 w-4" />
          Predict History
        </button>
      </div>

      <div className="mt-6 rounded-[20px] border border-blue-100 bg-blue-50 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#003B95]">
          Note
        </h3>
        <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-base">
          Prediction reviews the whole file first. Saving to the
          database happens only after you click the save button. The
          result modal automatically opens after successful prediction.
        </p>
      </div>
    </div>
  );
}