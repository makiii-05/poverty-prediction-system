import { Download } from "lucide-react";

export default function ReportsHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0056d2] p-6 text-white shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-blue-100">
            Poverty level reports, summaries, and model insights
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
    </div>
  );
}