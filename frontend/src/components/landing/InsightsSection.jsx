import RevealCard from "./RevealCard";

export default function InsightsSection() {
  const achievements = [
    "Supports analysis across 17 Philippine regions.",
    "Uses machine learning for poverty-level classification.",
    "Presents results through visual summaries and interactive insights.",
    "Improves accessibility of regional poverty-related information.",
  ];

  return (
    <section id="insights" className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <RevealCard delay={0}>
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#003B95]">
              Insights
            </p>
            <h2 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl">
              How the platform helps users better understand poverty-related data
            </h2>
          </div>
        </RevealCard>

        <div className="grid gap-6 md:grid-cols-2">
          {achievements.map((item, index) => (
            <RevealCard key={index} delay={index * 150}>
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#003B95]/10 font-bold text-[#003B95]">
                    {index + 1}
                  </div>
                  <p className="text-base leading-8 text-slate-700">{item}</p>
                </div>
              </div>
            </RevealCard>
          ))}
        </div>
      </div>
    </section>
  );
}