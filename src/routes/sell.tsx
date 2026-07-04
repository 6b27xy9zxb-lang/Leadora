import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/landing/FadeIn";
import { ContactButton } from "@/components/landing/ContactButton";
import { ThemeToggle } from "@/components/theme-provider";
import { Search, Wand2, DollarSign, Repeat, ArrowRight, Check, TrendingUp, Bell } from "lucide-react";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell — Leadora" },
      { name: "description", content: "Leadora gives you the leads, the AI tools, and the hosting — you keep 100% of what you charge." },
      { property: "og:title", content: "Turn Web Design into Recurring Revenue — Leadora" },
      { property: "og:description", content: "Leadora gives you the leads, the AI tools, and the hosting — you keep 100% of what you charge." },
    ],
  }),
  component: SellPage,
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
            to="/hosting"
            className="text-[var(--ls-text)] font-medium uppercase tracking-wider text-sm md:text-base lg:text-[1.1rem] transition-opacity duration-200 hover:opacity-70"
          >
            Hosting
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

function DashboardMockup() {
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="rounded-2xl border border-ls-border bg-[var(--ls-surface)] p-6 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[var(--ls-text)] font-semibold">Your Agency Dashboard</h3>
            <p className="text-[var(--ls-text)]/50 text-xs mt-0.5">Live revenue tracker</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#7621B0]/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-[var(--ls-text)]" />
          </div>
        </div>

        <div className="mb-6">
          <div className="text-[var(--ls-text)]/70 text-sm uppercase tracking-wider">Total Revenue</div>
          <div className="text-4xl font-black text-ls-text mt-1">{fmt(8420)}</div>
          <div className="flex items-center gap-2 mt-2 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+18% this month</span>
          </div>
        </div>

        <div className="rounded-xl border border-ls-border bg-ls-surface-elevated p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[var(--ls-text)]/80 text-sm font-medium">Monthly Revenue</span>
            <span className="text-xs text-[var(--ls-text)]/50">Last 6 months</span>
          </div>
          <svg viewBox="0 0 300 90" className="w-full h-[90px]" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0,80 C40,75 60,60 90,55 C120,50 150,40 180,35 C210,30 240,20 300,10 L300,90 L0,90 Z"
              fill="url(#revenueFill)"
            />
            <path
              d="M0,80 C40,75 60,60 90,55 C120,50 150,40 180,35 C210,30 240,20 300,10"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-900/20 border border-emerald-500/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[var(--ls-text)] text-sm font-medium">Payment Received</div>
              <div className="text-[var(--ls-text)]/60 text-xs">Joe&apos;s Pizza — $1,200 upfront + $95/mo</div>
            </div>
            <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const STEPS = [
  {
    icon: Search,
    title: "Spot the Opportunity",
    desc: "Use 200 monthly search credits on Pro to find website-less local businesses in any city or niche.",
  },
  {
    icon: Wand2,
    title: "Build in Minutes",
    desc: "Generate up to 50 AI cold-call scripts and website prompts per month, then spin up a branded preview site.",
  },
  {
    icon: DollarSign,
    title: "Sell High",
    desc: "Pitch a $750–$3,000 website plus a $75–$200/month retainer. Your Leadora plan starts at just $25/mo.",
  },
  {
    icon: Repeat,
    title: "Earn Forever",
    desc: "Host up to 25 client sites on Pro with custom domains and SSL — keep 100% of every recurring maintenance fee.",
  },
];

function StepsFlow() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative"
          >
            <div className="rounded-2xl border border-ls-border bg-ls-surface-elevated p-6 h-full hover:bg-ls-surface-elevated transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#7621B0]/20 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-[var(--ls-text)]" />
                </div>
                <span className="text-xs font-bold text-[#7621B0] uppercase tracking-widest">Step 0{i + 1}</span>
              </div>
              <h3 className="text-[var(--ls-text)] font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-[var(--ls-text)]/70 text-sm leading-relaxed">{step.desc}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-[var(--ls-text)]/30">
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SellPage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--ls-surface)" }}>
      <NavBar />
      <section className="relative px-5 sm:px-8 md:px-10 pt-20 sm:pt-28 md:pt-36 pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-2xl">
              <FadeIn delay={0} y={30}>
                <span className="inline-block rounded-full border border-ls-border bg-ls-surface-elevated px-4 py-1.5 text-xs sm:text-sm uppercase tracking-wider text-[var(--ls-text)]/80 mb-6">
                  Sell
                </span>
              </FadeIn>
              <FadeIn delay={0.1} y={30}>
                <h1 className="text-[var(--ls-text)] font-black uppercase tracking-tight leading-none" style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)" }}>
                  Turn Web Design into Recurring Revenue
                </h1>
              </FadeIn>
              <FadeIn delay={0.2} y={30}>
                <p className="mt-6 text-[var(--ls-text)]/80 text-lg sm:text-xl leading-relaxed">
                  Leadora gives you the leads, the AI tools, and the hosting — you keep 100% of what you charge.
                </p>
              </FadeIn>
              <FadeIn delay={0.3} y={30}>
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <ContactButton label="Start Selling" to="/auth" />
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center rounded-full border border-ls-border-strong px-6 py-3 text-sm font-medium text-[var(--ls-text)] transition-colors hover:bg-ls-surface-elevated"
                  >
                    View Pricing
                  </Link>
                </div>
              </FadeIn>
            </div>
            <DashboardMockup />
          </div>
        </div>

        <div className="mt-24 sm:mt-32">
          <FadeIn>
            <h2 className="text-center text-[var(--ls-text)] font-black uppercase tracking-tight mb-12 sm:mb-16" style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}>
              Your path to predictable income
            </h2>
          </FadeIn>
          <StepsFlow />
        </div>
      </section>
    </main>
  );
}
