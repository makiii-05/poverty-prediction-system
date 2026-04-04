import UserManagementActionButtons from "./UserManagementActionButtons";

function getRoleStyle(role) {
  const value = (role || "").toLowerCase();

  if (value === "admin") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default function UserManagementTable({ users, onEdit, onDelete, onChangePassword, }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Username
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id || index}
                className="border-t border-slate-100 transition hover:bg-slate-50"
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-800">
                  {user.name || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {user.username || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {user.email || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {user.address || "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleStyle(
                      user.role
                    )}`}
                  >
                    {user.role || "User"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                <UserManagementActionButtons
                  onEdit={() => onEdit(user)}
                  onDelete={() => onDelete(user)}
                  onChangePassword={() => onChangePassword(user)}
                  disableDelete={(user.role || "").toLowerCase() === "admin"}
                />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}