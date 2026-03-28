export default function AuthLeftPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#003B95] via-[#0047b3] to-[#002766] p-10 text-white lg:block">
      <div className="absolute left-[-50px] top-[-60px] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-[-50px] right-[-50px] h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between">
        <div>
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
            PLPS - PH
          </div>

          <h2 className="mt-8 text-4xl font-bold leading-tight">
            Welcome to the
            <span className="block">Poverty Level Prediction System</span>
          </h2>

          <p className="mt-5 max-w-md text-base leading-8 text-white/85">
            Access the platform to explore regional poverty data, manage your
            account, and interact with machine learning-based poverty analysis
            tools in one secure system.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-sm font-semibold">Secure Access</p>
            <p className="mt-1 text-sm text-white/80">
              User authentication for protected platform access.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-sm font-semibold">User Registration</p>
            <p className="mt-1 text-sm text-white/80">
              Create a user account directly from the landing page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}