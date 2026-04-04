import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getAllUser,
  updateUser,
  deleteUser,
  changeUserPassword,
} from "../../api/UserLoginAPI";
import { verifyAdminPassword } from "../../api/AdminActionAPI";

import UserManagementHeader from "../../components/user-management/UserManagementHeader";
import UserManagementStats from "../../components/user-management/UserManagementStats";
import UserManagementFilters from "../../components/user-management/UserManagementFilters";
import UserManagementTable from "../../components/user-management/UserManagementTable";
import UserManagementMobileCards from "../../components/user-management/UserManagementMobileCards";
import UserManagementEmptyState from "../../components/user-management/UserManagementEmptyState";
import EditUserModal from "../../components/user-management/EditUserModal";
import DeleteUserModal from "../../components/user-management/DeleteUserModal";
import ChangePasswordModal from "../../components/user-management/ChangePasswordModal";
import ConfirmAction from "../../components/auth/ConfirmAction";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmType, setConfirmType] = useState("");
  const [pendingData, setPendingData] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllUser();
      setUsers(data.users || data.data || data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        (user.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (user.username || "").toLowerCase().includes(search.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        (user.role || "").toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(
      (user) => (user.role || "").toLowerCase() === "admin"
    ).length;
    const regularUsers = users.filter(
      (user) => (user.role || "").toLowerCase() === "user"
    ).length;

    return { total, admins, regularUsers };
  }, [users]);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleOpenDelete = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleOpenPassword = (user) => {
    setSelectedUser(user);
    setPasswordOpen(true);
  };

  const handleUpdateUser = async (updatedData) => {
    setPendingData(updatedData);
    setConfirmType("edit");
    setConfirmMessage("Are you sure you want to update this user?");
    setConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    setPendingData(null);
    setConfirmType("delete");
    setConfirmMessage(
      "Are you sure you want to delete this user?\n\nThis action cannot be undone."
    );
    setConfirmOpen(true);
  };

  const handleChangePassword = async (passwordData) => {
    setPendingData(passwordData);
    setConfirmType("password");
    setConfirmMessage("Are you sure you want to change this user's password?");
    setConfirmOpen(true);
  };

  const handleConfirmAction = async (adminPassword) => {
    try {
      setActionLoading(true);

      await verifyAdminPassword(adminPassword);

      if (confirmType === "edit") {
        await updateUser(selectedUser.id, pendingData);
        setEditOpen(false);
      }

      if (confirmType === "delete") {
        await deleteUser(selectedUser.id);
        setDeleteOpen(false);
      }

      if (confirmType === "password") {
        await changeUserPassword(selectedUser.id, pendingData);
        setPasswordOpen(false);
      }

      setConfirmOpen(false);
      setConfirmType("");
      setPendingData(null);
      setSelectedUser(null);

      await fetchUsers();
    } catch (err) {
      throw new Error(err.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <UserManagementHeader onRefresh={fetchUsers} loading={loading} />
          <UserManagementStats stats={stats} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <UserManagementFilters
              search={search}
              onSearchChange={setSearch}
              roleFilter={roleFilter}
              onRoleChange={setRoleFilter}
            />

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-16 text-center text-sm text-slate-500">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="mt-5">
                <UserManagementEmptyState />
              </div>
            ) : (
              <>
                <div className="mt-5 hidden md:block">
                  <UserManagementTable
                    users={filteredUsers}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    onChangePassword={handleOpenPassword}
                  />
                </div>

                <div className="mt-5 grid gap-4 md:hidden">
                  <UserManagementMobileCards
                    users={filteredUsers}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    onChangePassword={handleOpenPassword}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <EditUserModal
        open={editOpen}
        user={selectedUser}
        loading={actionLoading}
        onClose={() => {
          setEditOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleUpdateUser}
      />

      <DeleteUserModal
        open={deleteOpen}
        user={selectedUser}
        loading={actionLoading}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
      />

      <ChangePasswordModal
        open={passwordOpen}
        user={selectedUser}
        loading={actionLoading}
        onClose={() => {
          setPasswordOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleChangePassword}
      />

      <ConfirmAction
        isOpen={confirmOpen}
        onConfirm={handleConfirmAction}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmType("");
          setPendingData(null);
        }}
        message={confirmMessage}
        loading={actionLoading}
      />
    </AdminLayout>
  );
}