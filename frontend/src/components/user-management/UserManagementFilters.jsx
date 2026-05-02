import { Search, Plus } from "lucide-react";

export default function UserManagementFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleChange,
  onAddUser,
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, username, or email"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
        />
      </div>

      <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
        <button
          type="button"
          onClick={onAddUser}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003B95] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#002f7a] focus:outline-none focus:ring-2 focus:ring-[#003B95]/20"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>

        <div className="w-full md:w-52">
          <select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>
    </div>
  );
}