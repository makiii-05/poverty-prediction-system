import { useState } from "react";
import AuthModal from "../components/auth/AuthModal";
import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import ShowcaseSection from "../components/landing/ShowcaseSection";
import InsightsSection from "../components/landing/InsightsSection";
import CTASection from "../components/landing/CTASection";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-[#0f172a]">
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <LandingNavbar
        onLogin={() => setIsAuthOpen(true)}
        scrollToSection={scrollToSection}
      />

      <HeroSection
        onLogin={() => setIsAuthOpen(true)}
        scrollToSection={scrollToSection}
      />

      <AboutSection />
      <FeaturesSection />
      <ShowcaseSection />
      <InsightsSection />
      <CTASection onLogin={() => setIsAuthOpen(true)} />
      <LandingFooter />
    </div>
  );
}