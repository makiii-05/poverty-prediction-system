export default function ReportCard({
  title,
  value,
  subValue,
  icon: Icon,
  iconClass,
  bgClass,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-3 truncate text-2xl font-bold text-slate-800">{value}</p>
          {subValue ? (
            <p className="mt-1 text-sm font-medium text-slate-500">{subValue}</p>
          ) : null}
        </div>

        <div className={`rounded-2xl p-3 ${bgClass}`}>
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>
      </div>
    </div>
  );
}