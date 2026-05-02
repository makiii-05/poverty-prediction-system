import { SearchCheck } from "lucide-react";
import RevealCard from "./RevealCard";

export default function AboutSection() {
  const objectives = [
    "Identify the socioeconomic indicators that influence poverty levels in different regions of the Philippines.",
    "Analyze the relationship between regional indicators and poverty levels using machine learning techniques.",
    "Develop a model that classifies poverty levels into low, moderate, and high categories.",
    "Evaluate machine learning algorithms for poverty prediction performance.",
    "Support more informed and data-driven analysis and planning.",
  ];

  return (
    <section id="about" className="px-6 py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <RevealCard delay={0}>
          <div className="rounded-[32px] bg-[#003B95] p-8 text-white shadow-sm md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-white/15 p-3 text-white">
                <SearchCheck className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold">About the Platform</h3>
            </div>

            <p className="leading-8 text-white/85">
              PLPS - PH provides a structured way to examine poverty-related
              regional data instead of relying only on static tables or isolated
              reports.
            </p>

            <p className="mt-5 leading-8 text-white/85">
              The platform combines socioeconomic indicators, machine learning,
              and visualization tools to support clearer analysis and more
              meaningful interpretation of regional poverty patterns.
            </p>

            <div className="mt-6 border-t border-white/20 pt-6">
              <p className="text-sm text-white/70">
                The system emphasizes clarity, structure, and accessibility in
                presenting poverty-related data across regions.
              </p>
            </div>
          </div>
        </RevealCard>

        <RevealCard delay={180}>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#003B95]">
              Objectives
            </p>

            <h2 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl">
              What the system does and why it is useful
            </h2>

            <div className="mt-8 space-y-4">
              {objectives.map((item, index) => (
                <RevealCard key={index} delay={index * 120}>
                  <div className="flex gap-4 rounded-2xl border border-slate-200 bg-[#f8fbff] p-4">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#003B95]/10 text-sm font-bold text-[#003B95]">
                      {index + 1}
                    </div>
                    <p className="leading-7 text-slate-700">{item}</p>
                  </div>
                </RevealCard>
              ))}
            </div>
          </div>
        </RevealCard>
      </div>
    </section>
  );
}