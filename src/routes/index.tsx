import { createFileRoute } from "@tanstack/react-router";
import { HeroSection, WhyLeadoraSection, MarqueeSection, AboutSection, ServicesSection, AudienceSection, PricingSection, RevenueCalculatorSection, FaqSection, TeamSection, FooterSection } from "@/components/landing/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leadora — Find businesses without websites and close them" },
      { name: "description", content: "Find local businesses without websites, generate AI cold-call scripts, send trackable site previews, and close deals — all in one platform." },
      { property: "og:title", content: "Leadora — Find. Pitch. Close." },
      { property: "og:description", content: "The complete platform to find leads, generate AI scripts, host site previews, and close deals." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main style={{ background: "var(--ls-surface)", overflowX: "clip" }}>
      <HeroSection />
      <WhyLeadoraSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <AudienceSection />
      <PricingSection />
      <RevenueCalculatorSection />
      <FaqSection />
      <TeamSection />
      <FooterSection />
    </main>
  );
}

