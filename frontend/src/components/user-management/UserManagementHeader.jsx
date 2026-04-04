import { RefreshCw, Users } from "lucide-react";

export default function UserManagementHeader({ onRefresh, loading }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#003B95] to-[#0F4DB8] p-5 text-white shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/15 p-3">
            <Users className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold sm:text-2xl">User Management</h1>
            <p className="mt-1 text-sm text-blue-100">
              View and manage registered users in the system.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#003B95] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}