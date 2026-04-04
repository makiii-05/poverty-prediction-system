import { Users } from "lucide-react";

export default function UserManagementEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <Users className="h-6 w-6 text-slate-400" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-800">
        No users found
      </h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">
        No matching users were found based on your current search or filter.
      </p>
    </div>
  );
}