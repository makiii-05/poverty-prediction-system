import { AlertTriangle, ShieldCheck, Activity } from "lucide-react";

function InsightCard({ icon: Icon, title, text, iconClass, bgClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className={`rounded-2xl p-2.5 ${bgClass}`}>
          <Icon className={`h-4 w-4 ${iconClass}`} />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}

export default function InsightsSection({ insights }) {
  return (
    <section className="xl:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Insights Section</h2>
        <p className="mt-1 text-sm text-slate-500">
          Short interpretation of the current report data
        </p>
      </div>

      <div className="space-y-4 text-sm leading-7 text-slate-600">
        <InsightCard
          icon={AlertTriangle}
          title="Risk Insight"
          text={insights.topRiskText}
          iconClass="text-red-600"
          bgClass="bg-red-50"
        />
        <InsightCard
          icon={ShieldCheck}
          title="Stability Insight"
          text={insights.balanceText}
          iconClass="text-green-600"
          bgClass="bg-green-50"
        />
        <InsightCard
          icon={Activity}
          title="Monitoring Insight"
          text={insights.midText}
          iconClass="text-yellow-600"
          bgClass="bg-yellow-50"
        />
      </div>
    </section>
  );
}