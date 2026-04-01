import {
  UploadCloud,
  BarChart3,
  Database,
  RotateCcw,
} from "lucide-react";

export default function AdminPredictUploadCard({
  fileInputRef,
  file,
  loading,
  saving,
  result,
  onUploadClick,
  onFileChange,
  onPredict,
  onUndo,
  onSave,
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-xl font-bold text-slate-900 sm:text-[1.7rem]">
        Prediction Upload
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-500 sm:text-base">
        Upload an Excel or CSV file containing the required indicators.
        The system will predict the whole file, not just one row.
      </p>

      <div className="mt-7">
        <label className="mb-3 block text-base font-semibold text-slate-800">
          Dataset File
        </label>

        <div
          onClick={onUploadClick}
          className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-[#003B95]/40 hover:bg-slate-100"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={onFileChange}
            className="hidden"
          />

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#003B95]/10">
            <UploadCloud className="h-7 w-7 text-[#003B95]" />
          </div>

          {!file ? (
            <>
              <p className="text-base font-semibold text-[#003B95]">
                Choose file or drag &amp; drop
              </p>
              <p className="mt-1 text-xs text-slate-500">
                CSV, XLS, XLSX • whole file will be predicted
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Selected File
              </p>
              <p className="mt-2 break-all text-base font-semibold text-[#003B95]">
                {file.name}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={onPredict}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003B95] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#002f7a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BarChart3 className="h-4 w-4" />
          {loading ? "Predicting..." : "Predict"}
        </button>

        <button
          type="button"
          onClick={onUndo}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          Undo
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!result?.rows?.length || saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 xl:col-span-1"
        >
          <Database className="h-4 w-4" />
          {saving ? "Saving..." : "Save to Database"}
        </button>
      </div>
    </div>
  );
}