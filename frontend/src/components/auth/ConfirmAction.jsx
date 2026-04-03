import { useEffect, useState } from "react";

export default function ConfirmAction({
  isOpen,
  onConfirm,
  onCancel,
  message = "This action cannot be undone.",
  loading = false,
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!lockUntil) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [lockUntil]);

  useEffect(() => {
    if (lockUntil && Date.now() >= lockUntil) {
      setLockUntil(null);
      setFailedAttempts(0);
      setError("");
    }
  }, [now, lockUntil]);

  if (!isOpen) return null;

  const isLocked = lockUntil && Date.now() < lockUntil;

  const getLockMessage = () => {
    if (!isLocked) return "";
    const secondsLeft = Math.ceil((lockUntil - Date.now()) / 1000);
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `Too many failed attempts. Try again in ${minutes}m ${seconds}s.`;
  };

  const handleConfirm = async () => {
    if (isLocked) {
      setError(getLockMessage());
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setError("");

    try {
      await onConfirm(password);
      setPassword("");
      setError("");
      setFailedAttempts(0);
    } catch (err) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= 3) {
        const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
        setLockUntil(fiveMinutesFromNow);
        setError("Too many failed attempts. Locked for 5 minutes.");
        return;
      }

      setError(err.message || `Wrong password. Attempt ${nextAttempts} of 3.`);
    }
  };

  const handleCancel = () => {
    setPassword("");
    setError("");
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-800">Confirm Action</h2>

        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
          {message}
        </p>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Enter admin password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLocked || loading}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#003B95] focus:ring-2 focus:ring-[#003B95]/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            placeholder="Enter password"
          />

          {isLocked && (
            <p className="mt-2 text-sm font-medium text-red-600">
              {getLockMessage()}
            </p>
          )}

          {!isLocked && error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          {!isLocked && failedAttempts > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              Failed attempts: {failedAttempts} / 3
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isLocked || loading}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Checking..." : isLocked ? "Locked" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}