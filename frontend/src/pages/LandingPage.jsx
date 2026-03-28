import { useState } from "react";
import {
  BarChart3,
  Database,
  LineChart,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  SearchCheck
} from "lucide-react";
import AuthModal from "../components/AuthModal";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-[#003B95]">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#003B95]/10 bg-white/95 shadow-[0_4px_20px_rgba(0,59,149,0.06)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          {/* Brand */}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#003B95] to-[#002766] text-white shadow-md">
              <BarChart3 className="h-5 w-5" />
            </div>

            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-wide text-[#003B95]">
                PLPS - PH
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Poverty Level Prediction System
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden items-center rounded-full border border-[#003B95]/10 bg-[#f8fbff] px-3 py-2 lg:flex">
            {[
              { label: "Home", id: "home" },
              { label: "About", id: "about" },
              { label: "Service", id: "service" }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="relative rounded-full px-5 py-2 text-sm font-semibold text-[#003B95] transition hover:bg-white hover:text-[#002766]"
              >
                <span className="relative after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-[#002766] after:transition-all after:duration-300 hover:after:w-full">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="rounded-full bg-gradient-to-r from-[#003B95] to-[#002766] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-[#003B95] via-[#0047b3] to-[#002766] text-white"
      >
        <div className="absolute left-[-60px] top-[-60px] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-40px] h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="mx-auto grid min-h-[92vh] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
              <Sparkles className="h-4 w-4" />
              Machine Learning-Powered Regional Poverty Analysis
            </div>

            <div className="space-y-4">
              <h2 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Poverty Level Prediction System
              </h2>

              <p className="max-w-2xl text-base leading-8 text-white/85 md:text-lg">
                PLPS - PH is a web-based platform designed to analyze regional
                socioeconomic indicators and classify poverty levels using
                machine learning. It helps transform raw data into clearer,
                more meaningful insights for poverty assessment and development
                planning.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="rounded-xl bg-white px-6 py-3 font-semibold text-[#003B95] shadow-md transition hover:bg-slate-100"
              >
                Login
              </button>

              <button
                onClick={() => scrollToSection("about")}
                className="rounded-xl border border-white/25 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Learn More
              </button>
            </div>

            <div className="grid max-w-2xl gap-4 pt-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-2xl font-bold">17</p>
                <p className="mt-1 text-sm text-white/80">Philippine Regions</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-2xl font-bold">ML</p>
                <p className="mt-1 text-sm text-white/80">Predictive classification</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-2xl font-bold">Data</p>
                <p className="mt-1 text-sm text-white/80">Regional Socioeconomic Indicators</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[540px] rounded-[30px] border border-white/15 bg-white/95 p-5 text-[#003B95] shadow-2xl">
              <div className="rounded-2xl bg-[#003B95] px-5 py-5 text-white shadow-sm">
                <p className="text-sm font-medium text-white/75">
                  Analytics Overview
                </p>
                <h3 className="mt-1 text-2xl font-bold">
                  Regional Poverty Insights
                </h3>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#003B95]/10 bg-[#003B95]/5 p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <BarChart3 className="mb-3 h-9 w-9 text-[#003B95]" />
                  <h4 className="text-lg font-semibold">Indicators</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Key variables such as income, expenditure, unemployment,
                    education, and population.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#003B95]/10 bg-[#003B95]/5 p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <LineChart className="mb-3 h-9 w-9 text-[#003B95]" />
                  <h4 className="text-lg font-semibold">Prediction</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Classifies poverty levels into low, medium, and high
                    categories using trained models.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#003B95]/10 bg-[#003B95]/5 p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <Database className="mb-3 h-9 w-9 text-[#003B95]" />
                  <h4 className="text-lg font-semibold">Dataset</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Uses historical regional datasets for systematic analysis
                    and model evaluation.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#003B95]/10 bg-[#003B95]/5 p-5 transition hover:-translate-y-1 hover:shadow-md">
                  <ShieldCheck className="mb-3 h-9 w-9 text-[#003B95]" />
                  <h4 className="text-lg font-semibold">Support</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Helps users make more informed, evidence-based regional
                    planning decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-[#f8fbff] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="rounded-full bg-[#003B95]/10 px-4 py-2 text-sm font-semibold text-[#003B95]">
              About the System
            </span>
            <h2 className="mt-5 text-3xl font-bold md:text-4xl">
              A system built for smarter poverty analysis
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              PLPS - PH focuses on identifying patterns in regional data and
              supporting poverty analysis through machine learning and data
              visualization.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] border border-[#003B95]/10 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-[#003B95]/10 p-3 text-[#003B95]">
                  <SearchCheck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">Objectives of the Study</h3>
              </div>

              <div className="space-y-4">
                {[
                  "Identify the socioeconomic indicators that influence poverty levels in different regions of the Philippines.",
                  "Analyze the relationship between socioeconomic indicators and poverty levels using machine learning techniques.",
                  "Develop a model that classifies regional poverty levels into low, medium, and high categories.",
                  "Evaluate the performance of different machine learning algorithms for poverty prediction.",
                  "Support data-driven decision-making related to poverty analysis and regional development."
                ].map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-[#003B95]/10 bg-[#f8fbff] p-4 text-slate-700 shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#003B95]/10 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-[#003B95]/10 p-3 text-[#003B95]">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">What the System Does</h3>
              </div>

              <div className="space-y-5 text-slate-600">
                <p className="leading-8">
                  PLPS - PH is designed to move beyond static poverty reports by
                  using regional socioeconomic data to uncover patterns and
                  classify poverty conditions more intelligently.
                </p>

                <p className="leading-8">
                  Instead of simply presenting numbers, the system provides a
                  structured platform for understanding how variables such as
                  income, expenditure, unemployment, education, and population
                  relate to regional poverty levels.
                </p>

                <p className="leading-8">
                  Through its web-based interface, users can explore data,
                  review prediction outputs, and gain a clearer perspective on
                  how machine learning can support poverty-related analysis in
                  the Philippine setting.
                </p>

                <div className="pt-3">
                  <button
                    onClick={() => scrollToSection("service")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#003B95] px-6 py-3 font-semibold text-white transition hover:bg-[#002766]"
                  >
                    Explore Services
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service */}
      <section id="service" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="rounded-full bg-[#003B95]/10 px-4 py-2 text-sm font-semibold text-[#003B95]">
              Services
            </span>
            <h2 className="mt-5 text-3xl font-bold md:text-4xl">
              Core system capabilities
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              The platform is designed to make regional poverty analysis more
              organized, accessible, and useful for decision support.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="group rounded-[28px] border border-[#003B95]/10 bg-[#f8fbff] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-5 inline-flex rounded-2xl bg-[#003B95] p-3 text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#003B95]">
                Regional Data Viewing
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                View and explore regional socioeconomic data used in poverty
                analysis, including the indicators relevant to the model.
              </p>
            </div>

            <div className="group rounded-[28px] border border-[#003B95]/10 bg-[#f8fbff] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-5 inline-flex rounded-2xl bg-[#003B95] p-3 text-white">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#003B95]">
                Poverty Prediction
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Generate classification results that categorize regional poverty
                levels into low, medium, and high using machine learning.
              </p>
            </div>

            <div className="group rounded-[28px] border border-[#003B95]/10 bg-[#f8fbff] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-5 inline-flex rounded-2xl bg-[#003B95] p-3 text-white">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#003B95]">
                Visualization & Reporting
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Present trends, model outputs, and summaries in a clearer and
                more understandable format for analysis and reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#003B95] py-20 text-white">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Start exploring data-driven poverty insights
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80">
            Access the platform and explore how machine learning and regional
            indicators can support better poverty-level analysis.
          </p>

          <div className="mt-8">
           <button
            onClick={() => setIsAuthOpen(true)}
            className="rounded-xl bg-white px-7 py-3 font-semibold text-[#003B95] shadow-md transition hover:bg-slate-100"
          >
            Go to Login
          </button>

          {isAuthOpen && (
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
          )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#003B95]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-7 md:flex-row">
          <div>
            <h4 className="font-bold text-[#003B95]">PLPS - PH</h4>
            <p className="text-sm text-slate-500">
              Poverty Level Prediction System
            </p>
          </div>

          <div className="text-sm text-slate-500">
            © 2026 PLPS - PH. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}