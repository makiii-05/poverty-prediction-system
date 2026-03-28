import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function UserRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/users/me", {
          credentials: "include",
        });

        const data = await res.json();

        setAuthorized(res.ok && data.user?.role === "user");
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  return authorized ? children : <Navigate to="/unauthorized" replace />;
}