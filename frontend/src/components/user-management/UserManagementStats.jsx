import { Shield, UserCheck, Users } from "lucide-react";

export default function UserManagementStats({ stats }) {
  const items = [
    {
      label: "Total Users",
      value: stats.total,
      icon: <Users className="h-5 w-5 text-[#003B95]" />,
      bg: "bg-blue-50",
    },
    {
      label: "Admins",
      value: stats.admins,
      icon: <Shield className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      label: "Regular Users",
      value: stats.regularUsers,
      icon: <UserCheck className="h-5 w-5 text-amber-600" />,
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-800">
                {item.value}
              </h3>
            </div>

            <div className={`rounded-2xl p-3 ${item.bg}`}>{item.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}