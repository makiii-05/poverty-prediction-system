import {
  Globe2,
  LineChart,
  ShieldCheck,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import RevealCard from "./RevealCard";

export default function FeaturesSection() {
  const services = [
    {
      title: "Regional Data",
      desc: "Structured regional indicators that support analysis and comparison.",
      icon: Globe2,
    },
    {
      title: "Prediction",
      desc: "Classifies poverty level into low, moderate, and high categories.",
      icon: LineChart,
    },
    {
      title: "Decision Support",
      desc: "Helps users interpret patterns and support better planning.",
      icon: ShieldCheck,
    },
    {
      title: "Visualization",
      desc: "Transforms data into maps, charts, and accessible insights.",
      icon: LayoutDashboard,
    },
  ];

  return (
    <section id="features" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <RevealCard delay={0}>
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#003B95]">
              Core Features
            </p>
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">
              Key capabilities of the system
            </h2>
            <p className="mt-4 leading-8 text-slate-600">
              A more polished and organized way to view regional data, generate
              predictions, and understand results through visual summaries.
            </p>
          </div>
        </RevealCard>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((item, index) => {
            const Icon = item.icon;

            return (
              <RevealCard key={item.title} delay={index * 140}>
                <div
                  className={`h-full rounded-[28px] border p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                    index === 0
                      ? "border-[#003B95] bg-gradient-to-br from-[#003B95] to-[#0059dd] text-white"
                      : "border-slate-200 bg-[#fcfdff]"
                  }`}
                >
                  <div
                    className={`mb-5 inline-flex rounded-2xl p-3 ${
                      index === 0
                        ? "bg-white/20 text-white"
                        : "bg-[#003B95]/10 text-[#003B95]"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3
                    className={`text-xl font-bold ${
                      index === 0 ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`mt-3 leading-7 ${
                      index === 0 ? "text-white/90" : "text-slate-600"
                    }`}
                  >
                    {item.desc}
                  </p>

                  <div
                    className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${
                      index === 0 ? "text-white" : "text-[#003B95]"
                    }`}
                  >
                    Learn more
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </RevealCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}