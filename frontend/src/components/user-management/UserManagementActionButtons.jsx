import { Pencil, Trash2, KeyRound } from "lucide-react";

export default function UserManagementActionButtons({
  onEdit,
  onDelete,
  onChangePassword,
  disableDelete,
}) {
  return (
    <div className="flex items-center gap-2">
      {/* EDIT */}
      <button
        type="button"
        onClick={onEdit}
        title="Edit User"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {/* CHANGE PASSWORD */}
      <button
        type="button"
        onClick={onChangePassword}
        title="Change Password"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100"
      >
        <KeyRound className="h-4 w-4" />
      </button>

      {/* DELETE */}
      <button
        type="button"
        onClick={!disableDelete ? onDelete : undefined}
        disabled={disableDelete}
        title={disableDelete ? "Admin cannot be deleted" : "Delete User"}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition
          ${
            disableDelete
              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          }`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}