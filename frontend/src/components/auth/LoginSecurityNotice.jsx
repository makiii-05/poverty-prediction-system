import { ShieldAlert, TimerReset } from "lucide-react";

export default function LoginSecurityNotice({
  attempts,
  attemptsLeft,
  locked,
  timer,
  progressWidth,
  maxAttempts,
}) {
  if (!(attempts > 0 || locked)) return null;

  return (
    <div
      className={`mt-3 rounded-2xl border p-3 ${
        locked ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 rounded-full p-2 ${
            locked ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
          }`}
        >
          {locked ? (
            <ShieldAlert className="h-4 w-4" />
          ) : (
            <TimerReset className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p
              className={`text-sm font-semibold ${
                locked ? "text-red-700" : "text-amber-700"
              }`}
            >
              {locked ? "Login temporarily locked" : "Login security notice"}
            </p>

            {!locked && (
              <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                {attempts}/{maxAttempts} attempts used
              </span>
            )}
          </div>

          {locked ? (
            <p className="mt-1 text-xs leading-5 text-red-600">
              Too many failed login attempts. Please wait{" "}
              <span className="font-semibold">{timer}s</span> before trying
              again.
            </p>
          ) : (
            <p className="mt-1 text-xs leading-5 text-amber-700">
              You have <span className="font-semibold">{attemptsLeft}</span>{" "}
              login attempt{attemptsLeft !== 1 ? "s" : ""} remaining before
              temporary lock.
            </p>
          )}

          {!locked && (
            <>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-amber-200">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-300"
                  style={{ width: progressWidth }}
                />
              </div>

              <div className="mt-2 flex justify-between text-[11px] text-amber-700">
                <span>Attempt progress</span>
                <span>{attemptsLeft} remaining</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}