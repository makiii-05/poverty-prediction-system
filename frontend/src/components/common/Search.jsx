import { Search as SearchIcon, X } from "lucide-react";

export default function Search({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="flex w-full items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm transition focus-within:border-[#003B95] focus-within:ring-2 focus-within:ring-[#003B95]/20">
      <SearchIcon className="h-4 w-4 text-slate-500" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />

      {value && (
        <button
          onClick={() => onChange("")}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}