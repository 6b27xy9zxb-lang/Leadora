import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/landing/FadeIn";
import { ContactButton } from "@/components/landing/ContactButton";
import { ThemeToggle } from "@/components/theme-provider";
import { Globe, Shield, Zap, Check, ExternalLink, Server } from "lucide-react";

export const Route = createFileRoute("/hosting")({
  head: () => ({
    meta: [
      { title: "Hosting — Leadora" },
      { name: "description", content: "Deploy client websites in seconds with free SSL, a global CDN, and a custom leadora.app subdomain. No separate hosting account needed." },
      { property: "og:title", content: "Host Your Website Lightning Fast — Leadora" },
      { property: "og:description", content: "Deploy client websites in seconds with free SSL, a global CDN, and a custom leadora.app subdomain." },
    ],
  }),
  component: HostingPage,
});

function NavBar() {
  return (
    <FadeIn delay={0} y={-20}>
      <nav className="relative z-30 flex w-full items-center justify-between gap-4 px-6 md:px-10 pt-6 md:pt-8">
        <Link to="/" className="text-[var(--ls-text)] font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem]">
          Leadora
        </Link>
        <div className="flex items-center gap-5 sm:gap-7 md:gap-10">
          <Link
            to="/"
            className="text-[var(--ls-text)] font-medium uppercase tracking-wider text-sm md:text-base lg:text-[1.1rem] transition-opacity duration-200 hover:opacity-70"
          >
            Home
          </Link>
          <Link
            to="/contact"
            className="text-[var(--ls-text)] font-medium uppercase tracking-wider text-sm md:text-base lg:text-[1.1rem] transition-opacity duration-200 hover:opacity-70"
          >
            Contact
          </Link>
          <Link
            to="/auth"
            className="text-[var(--ls-text)] font-medium uppercase tracking-wider text-sm md:text-base lg:text-[1.1rem] transition-opacity duration-200 hover:opacity-70"
          >
            Sign In
          </Link>
          <ThemeToggle className="text-[var(--ls-text)] hover:bg-[var(--ls-surface-elevated)] hover:text-[var(--ls-text)]" />
        </div>
      </nav>
    </FadeIn>
  );
}

function DeploymentMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-xl mx-auto"
    >
      <div className="rounded-2xl border border-ls-border bg-[var(--ls-surface)] p-6 sm:p-8 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <div className="ml-auto text-[var(--ls-text)]/60 text-sm font-mono">leadora deploy</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-900/20 border border-emerald-500/20 p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-[var(--ls-text)] font-semibold text-lg">Deployment Successful</h3>
              <p className="text-[var(--ls-text)]/70 text-sm mt-1">Your client site is live and SSL is active.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 rounded-lg bg-ls-surface-elevated border border-ls-border px-4 py-3 flex items-center gap-3">
            <Globe className="w-5 h-5 text-[var(--ls-text)]/50" />
            <span className="text-[var(--ls-text)] font-mono text-sm truncate">my-site.leadora.app</span>
          </div>
          <a
            href="https://my-site.leadora.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7621B0] hover:bg-[#8B2BC7] text-ls-text px-6 py-3 font-medium text-sm transition-colors"
          >
            Visit Site
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

const CHECKLIST = [
  {
    icon: Shield,
    title: "Custom domain & SSL",
    desc: "Connect any domain you own. We provision and renew SSL automatically.",
  },
  {
    icon: Zap,
    title: "Instant global deployment",
    desc: "Push changes and they appear on 60+ edge locations worldwide in seconds.",
  },
  {
    icon: Check,
    title: "Free SSL certificates",
    desc: "Every site gets HTTPS by default — no manual setup, no extra cost.",
  },
  {
    icon: Server,
    title: "Professional [businessname].leadora.app URLs",
    desc: "Send clients a clean, branded subdomain while you keep their project organized.",
  },
];

function ChecklistCard() {
  return (
    <div className="w-full max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
      {CHECKLIST.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="rounded-xl border border-ls-border bg-ls-surface-elevated p-5 hover:bg-ls-surface-elevated transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#7621B0]/20 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-[var(--ls-text)]" />
            </div>
            <h3 className="text-[var(--ls-text)] font-semibold">{item.title}</h3>
          </div>
          <p className="text-[var(--ls-text)]/70 text-sm leading-relaxed">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}

function HostingPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--ls-surface)" }}>
      <NavBar />
      <section className="relative px-5 sm:px-8 md:px-10 pt-20 sm:pt-28 md:pt-36 pb-24 sm:pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn delay={0} y={30}>
            <span className="inline-block rounded-full border border-ls-border bg-ls-surface-elevated px-4 py-1.5 text-xs sm:text-sm uppercase tracking-wider text-[var(--ls-text)]/80 mb-6">
              Hosting
            </span>
          </FadeIn>
          <FadeIn delay={0.1} y={30}>
            <h1 className="text-[var(--ls-text)] font-black uppercase tracking-tight leading-none" style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)" }}>
              Host Your Website Lightning Fast
            </h1>
          </FadeIn>
          <FadeIn delay={0.2} y={30}>
            <p className="mt-6 text-[var(--ls-text)]/80 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Deploy client sites in seconds with free SSL, a global CDN, and a custom leadora.app subdomain — no separate hosting account needed.
            </p>
          </FadeIn>
          <FadeIn delay={0.3} y={30}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ContactButton label="Start Hosting Free" to="/auth" />
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-ls-border-strong px-6 py-3 text-sm font-medium text-[var(--ls-text)] transition-colors hover:bg-ls-surface-elevated"
              >
                View Plans
              </Link>
            </div>
          </FadeIn>
        </div>

        <div className="mt-16 sm:mt-24">
          <DeploymentMockup />
        </div>

        <div className="mt-16 sm:mt-24">
          <ChecklistCard />
        </div>
      </section>
    </main>
  );
}
