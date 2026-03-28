import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/UserLoginAPI";
import UserLayout from "../../layouts/UserLayout";

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (error) {
        window.location.href = "/unauthorized";
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
    <UserLayout>
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">Dashboard</p>

      <div className="mt-4 space-y-2">
        <p><strong>ID:</strong> {user?.id}</p>
        <p><strong>Username:</strong> {user?.username}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>
    </div>
    </UserLayout>
    </>
  );
}