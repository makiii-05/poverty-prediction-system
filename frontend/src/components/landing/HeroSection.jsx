import {
  Sparkles,
  Database,
  BrainCircuit,
  BarChart3,
} from "lucide-react";
import RevealCard from "./RevealCard";

export default function HeroSection({ onLogin, scrollToSection }) {
  const features = [
    {
      title: "Regional Data Analysis",
      desc: "Organized access to regional socioeconomic indicators for clearer poverty-level assessment.",
      icon: Database,
    },
    {
      title: "Prediction Model",
      desc: "Generate poverty-level classifications using a trained machine learning approach.",
      icon: BrainCircuit,
    },
    {
      title: "Visualization Tools",
      desc: "Explore maps, charts, and summaries for easier interpretation of regional insights.",
      icon: BarChart3,
    },
  ];

  return (
    <section
      id="home"
      className="relative overflow-hidden px-6 pb-16 pt-12 lg:pb-24 lg:pt-16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,59,149,0.08),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(0,71,179,0.08),transparent_30%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <RevealCard delay={0}>
          <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white px-8 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:px-12 md:py-14">
            <div className="absolute inset-y-0 left-0 w-24 bg-[#003B95]/5" />

            <div className="relative z-10 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#003B95]/10 px-4 py-2 text-sm font-semibold text-[#003B95]">
                <Sparkles className="h-4 w-4" />
                Machine Learning-Based Poverty Analysis
              </div>

              <h2 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                Smarter regional poverty insights through data and prediction
              </h2>

              <p className="mt-6 max-w-lg text-base leading-8 text-slate-600">
                PLPS - PH is a web-based platform designed to analyze regional
                socioeconomic indicators and classify poverty levels across the
                Philippines using machine learning and visual analytics.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={onLogin}
                  className="rounded-full bg-[#003B95] px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-[#002d73]"
                >
                  Login
                </button>

                <button
                  onClick={() => scrollToSection("about")}
                  className="rounded-full border border-slate-300 bg-white px-7 py-3 font-semibold text-slate-700 transition hover:border-[#003B95] hover:text-[#003B95]"
                >
                  Learn More
                </button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  { value: "17", label: "Regions Covered" },
                  { value: "ML", label: "Prediction Model" },
                  { value: "Charts", label: "Visual Analytics" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4"
                  >
                    <p className="text-xl font-bold text-[#003B95]">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealCard>

        <RevealCard delay={200}>
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#003B95] via-[#0047b3] to-[#002766] p-6 text-white shadow-[0_20px_60px_rgba(0,59,149,0.24)] md:p-8">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">
              <div className="rounded-[28px] bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm font-medium text-white/80">
                  Platform Overview
                </p>
                <h3 className="mt-2 text-3xl font-bold">
                  Data-driven and structured analysis
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/80">
                  The platform delivers a structured approach to analyzing regional
                  poverty indicators, enabling clearer insights and more informed
                  decision-making.
                </p>
              </div>
            </div>
          </div>
        </RevealCard>
      </div>

      <div className="relative mx-auto mt-10 grid max-w-7xl gap-6 md:grid-cols-3">
        {features.map((item, index) => {
          const Icon = item.icon;

          return (
            <RevealCard key={item.title} delay={index * 150}>
              <div className="group rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-5 inline-flex rounded-2xl bg-[#003B95]/10 p-3 text-[#003B95]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">{item.desc}</p>
              </div>
            </RevealCard>
          );
        })}
      </div>
    </section>
  );
}