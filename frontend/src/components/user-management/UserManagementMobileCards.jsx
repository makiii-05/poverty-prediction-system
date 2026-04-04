import UserManagementActionButtons from "./UserManagementActionButtons";

function getRoleStyle(role) {
  const value = (role || "").toLowerCase();

  if (value === "admin") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default function UserManagementMobileCards({
  users,
  onEdit,
  onDelete,
  onChangePassword,
}) {
  return (
    <>
      {users.map((user, index) => (
        <div
          key={user.id || index}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {user.name || "-"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                @{user.username || "-"}
              </p>
            </div>

            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleStyle(
                user.role
              )}`}
            >
              {user.role || "User"}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-700">Email:</span>{" "}
              {user.email || "-"}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Address:</span>{" "}
              {user.address || "-"}
            </p>
          </div>

          <div className="mt-4">
            <UserManagementActionButtons
              onEdit={() => onEdit(user)}
              onDelete={() => onDelete(user)}
              onChangePassword={() => onChangePassword(user)}
              disableDelete={(user.role || "").toLowerCase() === "admin"}
            />
          </div>
        </div>
      ))}
    </>
  );
}