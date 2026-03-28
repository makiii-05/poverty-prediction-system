import { useNavigate } from "react-router-dom";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fbff] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg border border-red-100 text-center">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
        <p className="mt-3 text-slate-600">
          You are not allowed to access this page.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 rounded-xl bg-[#003B95] px-5 py-3 text-white font-semibold"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}