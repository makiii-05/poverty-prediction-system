import RevealCard from "./RevealCard";

export default function ShowcaseSection() {
  const showcaseItems = [
    "Cleaner section spacing and hierarchy",
    "Professional cards and content grouping",
    "Improved readability across sections",
    "Same blue palette with stronger visual depth",
  ];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <RevealCard delay={0}>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#003B95]">
              Visual Showcase
            </p>

            <h2 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl">
              Designed for clearer presentation and stronger analysis
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              This upgraded layout gives your landing page a more professional
              structure by balancing information, visual sections, and call-to-action
              blocks in a cleaner and more organized way.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {showcaseItems.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4 text-sm font-medium text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </RevealCard>

        <RevealCard delay={160}>
          <div className="rounded-[32px] bg-gradient-to-br from-[#003B95] via-[#0047b3] to-[#002766] p-8 text-white shadow-[0_20px_60px_rgba(0,59,149,0.22)]">
            <h3 className="text-2xl font-bold">
              Structured and Insight-Driven Design
            </h3>

            <p className="mt-4 leading-7 text-white/85">
              The platform is designed with a focus on clarity and usability,
              allowing users to navigate data efficiently while maintaining
              a professional and consistent visual experience.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-white/90">
              <li>• Clear layout hierarchy for better readability</li>
              <li>• Organized data presentation and summaries</li>
              <li>• Consistent visual design across all modules</li>
              <li>• Focus on usability and analytical clarity</li>
            </ul>
          </div>
        </RevealCard>
      </div>
    </section>
  );
}