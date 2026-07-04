import { createFileRoute, Link } from "@tanstack/react-router";
import { TeamSection } from "@/components/landing/sections";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Leadora" },
      { name: "description", content: "Reach out directly to the Leadora leadership team." },
      { property: "og:title", content: "Contact — Leadora" },
      { property: "og:description", content: "Reach out directly to the Leadora leadership team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <main style={{ background: "var(--ls-surface)", minHeight: "100vh" }}>
      <header className="flex items-center justify-between px-6 md:px-10 py-6 md:py-8">
        <Link to="/" className="text-[var(--ls-text)] font-medium uppercase tracking-wider text-sm md:text-lg">
          Leadora
        </Link>
        <Link
          to="/"
          className="text-[var(--ls-text)] font-medium uppercase tracking-wider text-sm md:text-base hover:opacity-70 transition-opacity"
        >
          Back Home
        </Link>
      </header>
      <TeamSection />
    </main>
  );
}
