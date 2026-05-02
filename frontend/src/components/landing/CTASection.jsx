import { ArrowRight } from "lucide-react";
import RevealCard from "./RevealCard";

export default function CTASection({ onLogin }) {
  return (
    <section className="px-6 pb-20">
      <RevealCard delay={0}>
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] bg-[#003B95] px-8 py-14 text-white shadow-[0_20px_60px_rgba(0,59,149,0.22)] md:px-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-3xl font-black md:text-4xl">
                Start exploring poverty-level insights
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-white/85">
                Access the platform and explore how machine learning and regional
                socioeconomic indicators can support poverty analysis in the
                Philippines.
              </p>
            </div>

            <button
              onClick={onLogin}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 font-semibold text-[#003B95] transition hover:bg-slate-100"
            >
              Go to Login
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </RevealCard>
    </section>
  );
}