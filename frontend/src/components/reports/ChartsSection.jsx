import { Map, ChartColumn, ChartSpline } from "lucide-react";
import { Link } from "react-router-dom";

export default function ChartsSection() {
  const chartCards = [
    {
      title: "Map",
      description: "View regional distribution on the Philippine map.",
      icon: Map,
      path: "/admin/map",
    },
    {
      title: "Bar Chart",
      description: "Compare poverty levels across regions visually.",
      icon: ChartColumn,
      path: "/admin/bar-chart",
    },
    {
      title: "Line Chart",
      description: "Track poverty level trends over time.",
      icon: ChartSpline,
      path: "/admin/line-chart",
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">Charts Section</h2>
        <p className="mt-1 text-sm text-slate-500">
          Open each visualization page for a more detailed view
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {chartCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              to={card.path}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-[#003B95] hover:bg-white hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-2xl bg-blue-50 p-3">
                  <Icon className="h-5 w-5 text-[#003B95]" />
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                  Open
                </span>
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-800">
                {card.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}