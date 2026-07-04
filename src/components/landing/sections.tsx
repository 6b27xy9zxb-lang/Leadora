import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Copy, Check, X, Menu, Globe, Calculator, DollarSign, Minus, User, Building2, Layers, GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-provider";
import { toast } from "sonner";
import { Magnet } from "./Magnet";
import { FadeIn } from "./FadeIn";
import { ContactButton } from "./ContactButton";
import { ContactForm } from "./ContactForm";
import { copyToClipboard } from "@/lib/clipboard";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";





const portrait =
  "https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png";

function NavBar() {
  const items = [
    { label: "Features", href: "#features" },
    { label: "Hosting", to: "/hosting" },
    { label: "Sell", to: "/sell" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "How It Works", href: "#how" },
    { label: "Contact", to: "/contact" },
    { label: "Sign In", to: "/auth" },
  ];
  const [open, setOpen] = useState(false);

  const renderItem = (it: typeof items[number], onClick?: () => void) =>
    "to" in it ? (
      <Link
        key={it.label}
        to={it.to}
        onClick={onClick}
        className="text-ls-text font-medium uppercase tracking-wider text-sm md:text-base lg:text-[1.1rem] transition-opacity duration-200 hover:opacity-70"
      >
        {it.label}
      </Link>
    ) : (
      <a
        key={it.label}
        href={it.href}
        onClick={onClick}
        className="text-ls-text font-medium uppercase tracking-wider text-sm md:text-base lg:text-[1.1rem] transition-opacity duration-200 hover:opacity-70"
      >
        {it.label}
      </a>
    );

  return (
    <FadeIn delay={0} y={-20}>
      <nav className="relative z-30 flex w-full items-center justify-between gap-4 px-6 md:px-10 pt-6 md:pt-8">
        <a href="#top" className="text-ls-text font-medium uppercase tracking-wider text-sm md:text-lg lg:text-[1.4rem]">
          Leadora
        </a>
        <div className="hidden lg:flex items-center gap-7 lg:gap-10">
          {items.map((it) => renderItem(it))}
          <ThemeToggle className="text-ls-text hover:bg-ls-surface-elevated hover:text-ls-text" />
        </div>
        <div className="flex lg:hidden items-center gap-2">
          <ThemeToggle className="text-ls-text hover:bg-ls-surface-elevated hover:text-ls-text" />
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="text-ls-text p-2 rounded-md hover:bg-ls-surface-elevated"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="lg:hidden relative z-30 mx-6 mt-3 rounded-2xl border border-ls-border bg-ls-surface-elevated/95 backdrop-blur p-5 flex flex-col gap-4">
          {items.map((it) => renderItem(it, () => setOpen(false)))}
        </div>
      )}
    </FadeIn>
  );
}


export function HeroSection() {
  return (
    <section id="top" className="h-screen flex flex-col relative" style={{ overflowX: "clip" }}>
      <NavBar />

      <div className="overflow-hidden mt-6 sm:mt-4 md:-mt-5">
        <FadeIn delay={0.15} y={40}>
          <h1 className="hero-heading font-black uppercase tracking-tight leading-none w-full text-center text-[10vw] sm:text-[10vw] md:text-[10vw] lg:text-[11vw]">
            Find Businesses. Build Websites. Win More Clients.
          </h1>
        </FadeIn>
      </div>

      <Magnet
        padding={150}
        strength={3}
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-0 w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0"
      >
        <FadeIn delay={0.6} y={30}>
          <img src={portrait} alt="" className="w-full h-auto select-none pointer-events-none" />
        </FadeIn>
      </Magnet>

      <div className="mt-auto flex justify-between items-end px-6 md:px-10 pb-7 sm:pb-8 md:pb-10 relative z-20">
        <FadeIn delay={0.35} y={20}>
          <p
            className="text-ls-text font-light uppercase tracking-wide leading-snug max-w-[160px] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: "clamp(0.75rem, 1.4vw, 1.5rem)" }}
          >
            Leadora helps agencies, freelancers, and developers discover businesses without websites, generate AI-powered outreach, build stunning websites, and convert prospects into long-term clients.
          </p>

        </FadeIn>
        <FadeIn delay={0.5} y={20}>
          <ContactButton label="Start Free" to="/auth" />
        </FadeIn>
      </div>
    </section>
  );
}

export function WhyLeadoraSection() {
  const columns = [
    {
      title: "Manual Prospecting",
      negative: true,
      items: [
        "Hours of Google searching",
        "No way to verify gaps",
        "Cold outreach with no context",
      ],
    },
    {
      title: "Generic Lead Lists",
      negative: true,
      items: [
        "Outdated contact data",
        "Unverified business details",
        "Sold to everyone",
      ],
    },
    {
      title: "Leadora",
      negative: false,
      items: [
        "Fresh OpenStreetMap data",
        "Verified missing-website status",
        "AI script + prompt generated automatically",
      ],
    },
  ];

  return (
    <section id="why" className="relative bg-ls-surface px-5 sm:px-8 md:px-10 py-24 sm:py-32 md:py-40">
      <div className="max-w-6xl mx-auto">
        <FadeIn delay={0} y={30}>
          <h2 className="hero-heading font-black uppercase leading-none tracking-tight text-center mb-16 sm:mb-20" style={{ fontSize: "clamp(2.5rem, 8vw, 100px)" }}>
            Why Leadora?
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {columns.map((col, i) => (
            <FadeIn key={col.title} delay={0.1 + i * 0.1} y={30}>
              <div
                className={`rounded-2xl border p-6 sm:p-8 h-full transition-colors duration-200 ${
                  col.negative
                    ? "border-ls-border bg-ls-surface-elevated"
                    : "border-emerald-500/30 bg-emerald-500/[0.06]"
                }`}
              >
                <h3
                  className={`font-bold text-lg sm:text-xl mb-6 ${
                    col.negative ? "text-ls-text-muted" : "text-emerald-400"
                  }`}
                >
                  {col.negative ? <span className="line-through">{col.title}</span> : col.title}
                </h3>
                <ul className="space-y-4">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      {col.negative ? (
                        <X className="shrink-0 w-5 h-5 text-ls-text/30 mt-0.5" />
                      ) : (
                        <Check className="shrink-0 w-5 h-5 text-emerald-400 mt-0.5" />
                      )}
                      <span className={col.negative ? "text-ls-text-muted" : "text-ls-text"}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

const MARQUEE_IMAGES = [
  "hero-space-voyage-preview-eECLH3Yc","hero-codenest-preview-Cgppc2qV","hero-vex-ventures-preview-BczMFIiw",
  "hero-stellar-ai-v2-preview-DjvxjG3C","hero-asme-preview-B_nGDnTP","hero-transform-data-preview-Cx5OU29N",
  "hero-vitara-preview-Cjz2QYyU","hero-terra-preview-BFjrCr7T","hero-skyelite-preview-DHaZIgUv",
  "hero-aethera-preview-DknSlcTa","hero-designpro-preview-D8c5_een","hero-stellar-ai-preview-D3HL6bw1",
  "hero-xportfolio-preview-D4A8maiC","hero-orbit-web3-preview-BXt4OttD","hero-nexora-preview-cx5HmUgo",
  "hero-evr-ventures-preview-DZxeVFEX","hero-planet-orbit-preview-DWAP8Z1P","hero-new-era-preview-CocuDUm9",
  "hero-wealth-preview-B70idl_u","hero-luminex-preview-CxOP7ce6","hero-celestia-preview-0yO3jXO8",
].map((n) => `https://motionsites.ai/assets/${n}.gif`);

export function MarqueeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], [-200, 600]);
  const x2 = useTransform(scrollYProgress, [0, 1], [200, -600]);

  const row1 = [...MARQUEE_IMAGES.slice(0, 11), ...MARQUEE_IMAGES.slice(0, 11), ...MARQUEE_IMAGES.slice(0, 11)];
  const row2 = [...MARQUEE_IMAGES.slice(11), ...MARQUEE_IMAGES.slice(11), ...MARQUEE_IMAGES.slice(11)];

  return (
    <section ref={ref} className="bg-ls-surface pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden">
      <motion.div style={{ x: x1, willChange: "transform" }} className="flex gap-3 mb-3">
        {row1.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" className="rounded-2xl object-cover shrink-0" style={{ width: 420, height: 270 }} />
        ))}
      </motion.div>
      <motion.div style={{ x: x2, willChange: "transform" }} className="flex gap-3">
        {row2.map((src, i) => (
          <img key={i} src={src} alt="" loading="lazy" className="rounded-2xl object-cover shrink-0" style={{ width: 420, height: 270 }} />
        ))}
      </motion.div>
    </section>
  );
}

function AnimatedText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] });
  const chars = text.split("");
  return (
    <p
      ref={ref}
      className="text-center font-medium leading-relaxed max-w-[560px]"
      style={{ color: "var(--ls-text)", fontSize: "clamp(1rem, 2vw, 1.35rem)" }}
    >
      {chars.map((c, i) => {
        const start = i / chars.length;
        const end = start + 1 / chars.length;
        const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
        return (
          <motion.span key={i} style={{ opacity }}>
            {c}
          </motion.span>
        );
      })}
    </p>
  );
}

export function AboutSection() {
  const corners = [
    { src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png", cls: "top-[4%] left-[1%] sm:left-[2%] md:left-[4%] w-[120px] sm:w-[160px] md:w-[210px]", x: -80, delay: 0.1 },
    { src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png", cls: "bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] w-[100px] sm:w-[140px] md:w-[180px]", x: -80, delay: 0.25 },
    { src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png", cls: "top-[4%] right-[1%] sm:right-[2%] md:right-[4%] w-[120px] sm:w-[160px] md:w-[210px]", x: 80, delay: 0.15 },
    { src: "https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png", cls: "bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] w-[130px] sm:w-[170px] md:w-[220px]", x: 80, delay: 0.3 },
  ];
  return (
    <section id="features" className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 md:px-10 py-20 gap-10 sm:gap-14 md:gap-16">
      {corners.map((c, i) => (
        <FadeIn key={i} delay={c.delay} duration={0.9} x={c.x} y={0} className={`absolute ${c.cls}`}>
          <img src={c.src} alt="" className="w-full h-auto" />
        </FadeIn>
      ))}
      <FadeIn delay={0} y={40}>
        <h2 className="hero-heading font-black uppercase leading-none tracking-tight text-center" style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}>
          What it does
        </h2>
      </FadeIn>
      <AnimatedText text="Leadora finds local businesses with no website, writes the cold-call script for you, builds a preview site in minutes, and tracks the moment your prospect clicks. Stop guessing. Start closing." />
      <div className="mt-16 sm:mt-20 md:mt-24">
        <ContactButton label="Try it free" />
      </div>
    </section>
  );
}

const SERVICES = [
  { n: "01", name: "Find Leads", desc: "Search any city + business type. We detect missing websites and surface ready-to-pitch prospects.", mockup: "lead" as const },
  { n: "02", name: "AI Scripts", desc: "Generate cold-call scripts and AI builder prompts tailored to each business in one click.", mockup: "scripts" as const },
  { n: "03", name: "Build Previews", desc: "Spin up branded site previews with a trackable link the prospect can open from their phone.", mockup: "browser" as const },
  { n: "04", name: "Track & Close", desc: "See views, clicks, and timeline activity. Move leads through your CRM kanban to closed.", mockup: "stats" as const },
  { n: "05", name: "Scale", desc: "Plan tiers unlock more credits, hosting, and analytics so your agency keeps compounding.", mockup: "chart" as const },
];

function StepMockup({ kind }: { kind: "lead" | "scripts" | "browser" | "stats" | "chart" }) {
  if (kind === "lead") {
    return (
      <div className="w-full max-w-[280px] rounded-xl border border-black/10 bg-white shadow-sm p-4 text-left">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-[var(--ls-surface)] text-sm">Joe's Pizza</div>
            <div className="text-xs text-black/50 mt-0.5">Pizzeria · Brooklyn, NY</div>
          </div>
          <div className="text-xs font-medium text-amber-600">★ 4.6</div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-2 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600">No Website Detected</span>
        </div>
      </div>
    );
  }
  if (kind === "scripts") {
    return (
      <div className="w-full max-w-[290px] grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-black/10 bg-white shadow-sm p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-black/50 mb-1.5">Cold Call</div>
          <div className="text-[10px] leading-snug text-[var(--ls-surface)]/80">"Hi Joe, noticed your pizzeria doesn't have a site yet — I can spin one up by Friday…"</div>
        </div>
        <div className="rounded-lg border border-black/10 bg-[var(--ls-surface)] shadow-sm p-2.5">
          <div className="text-[9px] font-semibold uppercase tracking-wide border-ls-border/500 mb-1.5">AI Prompt</div>
          <div className="text-[10px] leading-snug text-ls-text/80 font-mono">Build a warm, modern site for Joe's Pizza w/ menu, hours, order CTA…</div>
        </div>
      </div>
    );
  }
  if (kind === "browser") {
    return (
      <div className="w-full max-w-[280px] rounded-lg border border-black/10 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-ls-surface/5 border-b border-black/10">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <div className="ml-2 flex-1 rounded bg-white border border-black/10 px-2 py-0.5 text-[10px] text-black/60 font-mono truncate">
            joespizza.leadora.app
          </div>
        </div>
        <div className="p-3">
          <div className="h-2 w-20 rounded bg-black/80 mb-1.5" />
          <div className="h-1.5 w-full rounded bg-ls-surface/10 mb-1" />
          <div className="h-1.5 w-5/6 rounded bg-ls-surface/10 mb-2.5" />
          <div className="h-6 w-16 rounded bg-[var(--ls-surface)]" />
        </div>
      </div>
    );
  }
  if (kind === "stats") {
    return (
      <div className="w-full max-w-[280px] rounded-xl border border-black/10 bg-white shadow-sm p-4 grid grid-cols-3 gap-2 text-left">
        <div>
          <div className="text-[9px] uppercase tracking-wide text-black/50 font-semibold">Total Views</div>
          <div className="text-xl font-black text-[var(--ls-surface)] mt-0.5">47</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wide text-black/50 font-semibold">Unique</div>
          <div className="text-xl font-black text-[var(--ls-surface)] mt-0.5">23</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wide text-black/50 font-semibold">CTA Clicks</div>
          <div className="text-xl font-black text-emerald-600 mt-0.5">8</div>
        </div>
      </div>
    );
  }
  const pts = [10, 18, 14, 28, 34, 30, 46, 54, 60, 72, 80, 96];
  const max = 100;
  const w = 260, h = 90, pad = 6;
  const step = (w - pad * 2) / (pts.length - 1);
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"} ${pad + i * step} ${h - pad - (v / max) * (h - pad * 2)}`).join(" ");
  const area = `${path} L ${pad + (pts.length - 1) * step} ${h - pad} L ${pad} ${h - pad} Z`;
  return (
    <div className="w-full max-w-[280px] rounded-xl border border-black/10 bg-white shadow-sm p-3">
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-black/50">Monthly Revenue</div>
        <div className="text-[10px] font-bold text-emerald-600">+312%</div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <path d={area} fill="rgba(16,185,129,0.12)" />
        <path d={path} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((v, i) => (
          <circle key={i} cx={pad + i * step} cy={h - pad - (v / max) * (h - pad * 2)} r="1.5" fill="#10B981" />
        ))}
      </svg>
    </div>
  );
}

export function ServicesSection() {
  return (
    <section id="how" className="bg-ls-surface-contrast px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]">
      <h2 className="text-center font-black uppercase mb-16 sm:mb-20 md:mb-28" style={{ color: "var(--ls-text-on-light)", fontSize: "clamp(3rem, 12vw, 160px)", lineHeight: 1 }}>
        How it works
      </h2>
      <div className="max-w-5xl mx-auto">
        {SERVICES.map((s, i) => (
          <FadeIn key={s.n} delay={i * 0.1}>
            <div className="grid grid-cols-[auto_1fr] gap-6 sm:gap-10 items-start py-8 sm:py-10 md:py-12 border-t border-ls-border-strong">
              <div className="font-black" style={{ color: "var(--ls-text-on-light)", fontSize: "clamp(3rem, 10vw, 140px)", lineHeight: 0.9 }}>
                {s.n}
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8 pt-2">
                <div className="flex flex-col gap-3 flex-1">
                  <h3 className="font-medium uppercase" style={{ color: "var(--ls-text-on-light)", fontSize: "clamp(1rem, 2.2vw, 2.1rem)", lineHeight: 1.1 }}>{s.name}</h3>
                  <p className="font-light leading-relaxed max-w-2xl" style={{ color: "var(--ls-text-on-light)", opacity: 0.6, fontSize: "clamp(0.85rem, 1.6vw, 1.25rem)" }}>{s.desc}</p>
                </div>
                <div className="shrink-0">
                  <StepMockup kind={s.mockup} />
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
        <div className="border-t border-ls-border-strong" />

      </div>
    </section>
  );
}

const AUDIENCES = [
  {
    icon: User,
    title: "Freelancers",
    subtitle: "Build your portfolio faster",
    desc: "Find local businesses to add to your client roster. Spend less time prospecting and more time designing.",
  },
  {
    icon: Building2,
    title: "Agencies",
    subtitle: "Keep your pipeline fed",
    desc: "Get qualified, website-less leads every week. Never run out of prospects for your sales team.",
  },
  {
    icon: Layers,
    title: "No-Code Builders",
    subtitle: "Create instant client demos",
    desc: "Pair Leadora's AI prompts with Framer, Webflow, or your favorite AI site builder to ship pages before the call ends.",
  },
  {
    icon: GraduationCap,
    title: "Students & First Clients",
    subtitle: "Land your first paying client",
    desc: "Skip cold-outreach guesswork. Start with verified businesses who already need a website.",
  },
];

export function AudienceSection() {
  return (
    <section className="bg-ls-surface px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <FadeIn delay={0} y={40}>
          <h2 className="text-center font-black uppercase mb-12 sm:mb-16 md:mb-20" style={{ color: "var(--ls-text)", fontSize: "clamp(2.5rem, 10vw, 140px)", lineHeight: 1 }}>
            Built for Web Professionals
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {AUDIENCES.map((a, i) => (
            <FadeIn key={a.title} delay={i * 0.1} y={30}>
              <div className="h-full rounded-2xl sm:rounded-3xl border border-ls-border bg-ls-surface-elevated p-6 sm:p-8 md:p-10 transition-colors hover:bg-ls-surface-elevated/80">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="shrink-0 rounded-xl p-3 sm:p-4 bg-ls-surface-elevated">
                    <a.icon className="w-5 h-5 sm:w-6 sm:h-6 text-ls-text" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold uppercase tracking-tight text-ls-text" style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)" }}>
                      {a.title}
                    </h3>
                    <p className="font-medium text-ls-text/80" style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.05rem)" }}>
                      {a.subtitle}
                    </p>
                    <p className="font-light leading-relaxed text-ls-text-muted" style={{ fontSize: "clamp(0.85rem, 1.5vw, 1rem)" }}>
                      {a.desc}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  { name: "Free", basePrice: 0, desc: "20 search credits / 5 AI scripts / basic CRM", featured: false },
  { name: "Pro", basePrice: 25, desc: "200 search credits / 50 AI scripts / hosting + analytics", featured: true },
  { name: "Max", basePrice: 50, desc: "500 search credits / 100 AI scripts / priority support", featured: false },
];

type BillingInterval = "monthly" | "quarterly" | "annual";

const INTERVALS: { value: BillingInterval; label: string; discount: number; saveBadge: string | null }[] = [
  { value: "monthly", label: "Monthly", discount: 0, saveBadge: null },
  { value: "quarterly", label: "Quarterly", discount: 0.15, saveBadge: "Save 15%" },
  { value: "annual", label: "Annual", discount: 0.25, saveBadge: "Save 25%" },
];

export function PricingSection() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const intervalInfo = INTERVALS.find((i) => i.value === interval)!;
  const multiplier = 1 - intervalInfo.discount;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

  const billingNote =
    interval === "monthly" ? "Billed monthly" : interval === "quarterly" ? "Billed quarterly" : "Billed annually";

  return (
    <section id="pricing" className="bg-ls-surface relative z-10 -mt-10 sm:-mt-12 md:-mt-14 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24">
      <FadeIn>
        <h2 className="hero-heading text-center font-black uppercase tracking-tight" style={{ fontSize: "clamp(3rem, 12vw, 160px)", lineHeight: 1 }}>
          Pricing
        </h2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="max-w-md mx-auto mt-10 flex flex-col items-center gap-3">
          <Tabs value={interval} onValueChange={(v) => setInterval(v as BillingInterval)} className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-ls-surface-elevated p-1.5 h-auto rounded-full border border-ls-border">
              {INTERVALS.map((i) => (
                <TabsTrigger
                  key={i.value}
                  value={i.value}
                  className="relative rounded-full py-2 text-sm font-medium uppercase tracking-wider text-ls-text/70 data-[state=active]:text-ls-text data-[state=active]:bg-[#7621B0] transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    {i.label}
                    {i.saveBadge && (
                      <span className="hidden sm:inline-flex items-center rounded-full bg-green-500/20 text-green-600 dark:text-green-300 text-[10px] font-semibold px-2 py-0.5">
                        {i.saveBadge}
                      </span>
                    )}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="text-ls-text-muted text-xs">{billingNote}</p>
        </div>
      </FadeIn>
      <div className="max-w-6xl mx-auto mt-12 grid gap-6 md:grid-cols-3">
        {PLANS.map((p, i) => (
          <FadeIn key={p.name} delay={i * 0.1}>
            <div className={`relative rounded-3xl p-8 h-full flex flex-col gap-6 border ${p.featured ? "border-[#7621B0] bg-gradient-to-b from-[#1a0a2b] to-ls-surface" : "border-ls-border bg-ls-surface-elevated"}`}>
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 btn-gradient text-ls-text text-[10px] font-medium uppercase tracking-widest px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div>
                <div className="text-ls-text uppercase tracking-widest text-sm">{p.name}</div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-ls-text">{fmt(p.basePrice * multiplier)}</span>
                  <span className="text-base font-light text-ls-text-muted">/mo</span>
                </div>
                {interval !== "monthly" && p.basePrice > 0 && (
                  <div className="mt-1 text-xs text-green-300">
                    You save {fmt(p.basePrice * intervalInfo.discount)} /mo vs monthly
                  </div>
                )}
              </div>
              <p className="text-ls-text/70 leading-relaxed">{p.desc}</p>
              <div className="mt-auto"><ContactButton label="Get started" /></div>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn delay={0.3}>
        <div className="max-w-4xl mx-auto mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-ls-text/80">
          {["OpenStreetMap-verified data", "Secure checkout", "Switch plans anytime", "Cancel before renewal"].map((badge) => (
            <div key={badge} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-ls-text" />
              <span>{badge}</span>
            </div>
          ))}
        </div>
      </FadeIn>
      <FadeIn delay={0.4}>
        <div className="max-w-5xl mx-auto mt-20 sm:mt-24">
          <h3 className="text-center text-2xl sm:text-3xl font-black text-ls-text mb-10">Compare every feature</h3>
          <div className="overflow-x-auto rounded-2xl border border-ls-border bg-ls-surface-elevated">
            <table className="w-full text-left text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-ls-border">
                  <th className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text font-medium uppercase tracking-wider">Feature</th>
                  <th className="px-5 py-4 text-center text-ls-text font-medium uppercase tracking-wider">Free</th>
                  <th className="px-5 py-4 text-center text-ls-text font-medium uppercase tracking-wider bg-[#7621B0]/10">Pro</th>
                  <th className="px-5 py-4 text-center text-ls-text font-medium uppercase tracking-wider">Max</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-ls-border bg-ls-surface-elevated">
                  <td colSpan={4} className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#7621B0]">Search & Lead Discovery</td>
                </tr>
                <tr className="border-t border-ls-border/50">
                  <td className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text/80">Search credits / month</td>
                  <td className="px-5 py-4 text-center text-ls-text/70">20</td>
                  <td className="px-5 py-4 text-center text-ls-text bg-[#7621B0]/10">200</td>
                  <td className="px-5 py-4 text-center text-ls-text/70">500</td>
                </tr>
                <tr className="border-t border-ls-border/50">
                  <td className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text/80">Advanced search</td>
                  <td className="px-5 py-4 text-center"><Minus className="w-4 h-4 text-ls-text/30 mx-auto" /></td>
                  <td className="px-5 py-4 text-center bg-[#7621B0]/10"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="px-5 py-4 text-center"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-t border-ls-border/50">
                  <td className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text/80">Max results per search</td>
                  <td className="px-5 py-4 text-center text-ls-text/70">Unlimited</td>
                  <td className="px-5 py-4 text-center text-ls-text bg-[#7621B0]/10">Unlimited</td>
                  <td className="px-5 py-4 text-center text-ls-text/70">Unlimited</td>
                </tr>
                <tr className="border-t border-ls-border bg-ls-surface-elevated">
                  <td colSpan={4} className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#7621B0]">AI Tools</td>
                </tr>
                <tr className="border-t border-ls-border/50">
                  <td className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text/80">AI website prompt generator</td>
                  <td className="px-5 py-4 text-center"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="px-5 py-4 text-center bg-[#7621B0]/10"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="px-5 py-4 text-center"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-t border-ls-border/50">
                  <td className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text/80">AI website plans / month</td>
                  <td className="px-5 py-4 text-center text-ls-text/70">5</td>
                  <td className="px-5 py-4 text-center text-ls-text bg-[#7621B0]/10">50</td>
                  <td className="px-5 py-4 text-center text-ls-text/70">100</td>
                </tr>
                <tr className="border-t border-ls-border/50">
                  <td className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text/80">AI cold-call scripts / month</td>
                  <td className="px-5 py-4 text-center text-ls-text/70">5</td>
                  <td className="px-5 py-4 text-center text-ls-text bg-[#7621B0]/10">50</td>
                  <td className="px-5 py-4 text-center text-ls-text/70">100</td>
                </tr>
                <tr className="border-t border-ls-border bg-ls-surface-elevated">
                  <td colSpan={4} className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#7621B0]">Hosting & Selling</td>
                </tr>
                <tr className="border-t border-ls-border/50">
                  <td className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text/80">Custom domain & SSL</td>
                  <td className="px-5 py-4 text-center"><Minus className="w-4 h-4 text-ls-text/30 mx-auto" /></td>
                  <td className="px-5 py-4 text-center bg-[#7621B0]/10"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="px-5 py-4 text-center"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-t border-ls-border/50">
                  <td className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text/80">Sell websites to clients</td>
                  <td className="px-5 py-4 text-center"><Minus className="w-4 h-4 text-ls-text/30 mx-auto" /></td>
                  <td className="px-5 py-4 text-center bg-[#7621B0]/10"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="px-5 py-4 text-center"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-t border-ls-border/50">
                  <td className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text/80">Active hosted projects</td>
                  <td className="px-5 py-4 text-center text-ls-text/70">0</td>
                  <td className="px-5 py-4 text-center text-ls-text bg-[#7621B0]/10">25</td>
                  <td className="px-5 py-4 text-center text-ls-text/70">100</td>
                </tr>
                <tr className="border-t border-ls-border bg-ls-surface-elevated">
                  <td colSpan={4} className="px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#7621B0]">Support</td>
                </tr>
                <tr className="border-t border-ls-border/50">
                  <td className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text/80">Email support</td>
                  <td className="px-5 py-4 text-center"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="px-5 py-4 text-center bg-[#7621B0]/10"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                  <td className="px-5 py-4 text-center"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-t border-ls-border/50">
                  <td className="sticky left-0 z-10 bg-ls-surface px-5 py-4 text-ls-text/80">Priority support</td>
                  <td className="px-5 py-4 text-center"><Minus className="w-4 h-4 text-ls-text/30 mx-auto" /></td>
                  <td className="px-5 py-4 text-center bg-[#7621B0]/10"><Minus className="w-4 h-4 text-ls-text/30 mx-auto" /></td>
                  <td className="px-5 py-4 text-center"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

export function RevenueCalculatorSection() {
  const [websitesSold, setWebsitesSold] = useState(2);
  const [upfrontPrice, setUpfrontPrice] = useState(750);
  const [maintenanceFee, setMaintenanceFee] = useState(75);

  const monthlyUpfrontRevenue = websitesSold * upfrontPrice;
  const projectedMrrAfter12Months = websitesSold * 12 * maintenanceFee;
  const projectedFirstYearIncome = websitesSold * 12 * upfrontPrice + websitesSold * maintenanceFee * 78;

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <section id="calculator" className="bg-ls-surface relative z-10 px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32">
      <FadeIn>
        <div className="flex items-center justify-center gap-3 mb-4">
          <Calculator className="w-6 h-6 text-ls-text" />
          <span className="text-ls-text uppercase tracking-widest text-sm font-medium">Revenue Calculator</span>
        </div>
        <h2 className="hero-heading text-center font-black uppercase tracking-tight" style={{ fontSize: "clamp(2.5rem, 9vw, 120px)", lineHeight: 1 }}>
          What's Your Freedom Number?
        </h2>
      </FadeIn>
      <div className="max-w-4xl mx-auto mt-16">
        <div className="grid gap-10 md:gap-14">
          <FadeIn>
            <div className="space-y-10 rounded-3xl border border-ls-border bg-ls-surface-elevated p-6 sm:p-10">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-ls-text font-medium">Websites sold per month</label>
                  <span className="text-ls-text font-black text-lg">{websitesSold}</span>
                </div>
                <Slider value={[websitesSold]} min={1} max={10} step={1} onValueChange={(v) => setWebsitesSold(v[0])} />
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-ls-text font-medium">Upfront price per site</label>
                  <span className="text-ls-text font-black text-lg">{fmt(upfrontPrice)}</span>
                </div>
                <Slider value={[upfrontPrice]} min={300} max={3000} step={50} onValueChange={(v) => setUpfrontPrice(v[0])} />
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-ls-text font-medium">Monthly maintenance fee per client</label>
                  <span className="text-ls-text font-black text-lg">{fmt(maintenanceFee)}</span>
                </div>
                <Slider value={[maintenanceFee]} min={25} max={200} step={5} onValueChange={(v) => setMaintenanceFee(v[0])} />
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-ls-border bg-ls-surface-elevated p-6 text-center">
                <div className="text-ls-text uppercase tracking-wider text-xs font-medium mb-2">Monthly Upfront Revenue</div>
                <div className="text-3xl sm:text-4xl font-black text-ls-text">{fmt(monthlyUpfrontRevenue)}</div>
                <div className="mt-2 text-ls-text-muted text-sm">every month</div>
              </div>
              <div className="rounded-2xl border border-[#7621B0]/50 bg-gradient-to-b from-[#1a0a2b] to-ls-surface p-6 text-center">
                <div className="text-ls-text uppercase tracking-wider text-xs font-medium mb-2">Projected MRR After 12 Months</div>
                <div className="text-3xl sm:text-4xl font-black text-ls-text">{fmt(projectedMrrAfter12Months)}</div>
                <div className="mt-2 text-ls-text-muted text-sm">per month</div>
              </div>
              <div className="rounded-2xl border border-ls-border bg-ls-surface-elevated p-6 text-center">
                <div className="text-ls-text uppercase tracking-wider text-xs font-medium mb-2">Projected First Year Income</div>
                <div className="text-3xl sm:text-4xl font-black text-ls-text">{fmt(projectedFirstYearIncome)}</div>
                <div className="mt-2 text-ls-text-muted text-sm">upfront + MRR</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "What is Leadora?", a: "Finds local businesses with no website using OpenStreetMap data via the Overpass API, scores each lead, and gives you verified contact info to reach out." },
  { q: "How accurate is the lead data?", a: "Pulled live from OpenStreetMap business listings and checked for an existing website at search time." },
  { q: "What's the difference between Free, Pro, and Max?", a: "Free: 20 search credits / 5 AI scripts. Pro ($25/mo): 200 search credits / 50 AI scripts / hosting + analytics. Max ($50/mo): 500 search credits / 100 AI scripts / priority support." },
  { q: "What happens if I run out of credits?", a: "Your account keeps working; you just can't run new searches until your monthly reset, or you can upgrade for an immediate bump." },
  { q: "When do credits reset?", a: "On your billing date each month. Unused credits don't roll over." },
  { q: "Can I sell websites to my clients through Leadora?", a: "Yes, Pro and Max include client-facing hosting with custom domains." },
  { q: "How do I cancel?", a: "Cancel anytime from account settings, no exit fees, instant switch back to Free." },
  { q: "Do you offer refunds?", a: "We don't offer refunds on subscription payments because credits are consumed immediately once a plan is active. If you were charged incorrectly or have a billing dispute, contact us within 7 days and we'll make it right." },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-ls-surface relative z-10 px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32">
      <FadeIn>
        <h2 className="hero-heading text-center font-black uppercase tracking-tight" style={{ fontSize: "clamp(3rem, 12vw, 160px)", lineHeight: 1 }}>
          Questions, answered.
        </h2>
      </FadeIn>
      <div className="max-w-3xl mx-auto mt-16">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((item, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <AccordionItem value={`item-${i}`} className="border-ls-border bg-ls-surface-elevated rounded-2xl mb-4 px-6 data-[state=open]:bg-ls-surface-elevated/80 transition-colors">
                <AccordionTrigger className="text-ls-text text-base sm:text-lg font-medium hover:no-underline py-5 [&>svg]:text-ls-text-muted">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-ls-text/70 text-sm sm:text-base leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            </FadeIn>
          ))}
        </Accordion>
      </div>
    </section>
  );
}


const TEAM = [
  { name: "Himanshu Pal", role: "CEO & Owner", email: "himanshupal151008@gmail.com", linkedin: "https://www.linkedin.com/in/himanshu-pal-ba795337b", website: undefined as string | undefined },
  { name: "Mahi Talwani", role: "Brand President", email: "talwanimahi@gmail.com", linkedin: "https://www.linkedin.com/in/mahi-talwani-9a850a391/", website: undefined as string | undefined },
];


function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(email);
      setCopied(true);
      toast.success("Email copied", { description: email });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
      toast.error("Couldn't copy", { description: "Please copy the email manually." });
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy ${email}`}
      className="ml-2 inline-flex items-center justify-center rounded-lg p-1.5 text-ls-text-muted hover:text-ls-text hover:bg-ls-surface-elevated transition-colors"
      title="Copy email"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function CopyLinkedInUrl({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false);

  const logEvent = async (status: "success" | "error", errorMessage?: string) => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("linkedin_copy_events").insert({
        member_name: name,
        linkedin_url: url,
        status,
        error_message: errorMessage ?? null,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      if (error) console.error("linkedin_copy_events log failed", error);
    } catch (err) {
      console.error("linkedin_copy_events log threw", err);
    }
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(url);
      setCopied(true);
      toast.success("LinkedIn URL copied", {
        description: "Paste it into a new browser tab to view the profile.",
      });
      setTimeout(() => setCopied(false), 2500);
      void logEvent("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Copy LinkedIn URL failed", err);
      toast.error("Couldn't copy LinkedIn URL", {
        description: "Use the text field below to copy the link manually.",
      });
      void logEvent("error", message);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={handleCopy}
        aria-label={`Copy ${name}'s LinkedIn URL`}
        className="inline-flex items-center gap-2 text-ls-text hover:text-ls-text-muted transition-colors"
        style={{ fontSize: "clamp(1rem, 1.6vw, 1.15rem)" }}
        title="Copy LinkedIn URL"
      >
        {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
        {copied ? "Copied" : "Copy LinkedIn URL"}
      </button>

      <div className="w-full">
        <label htmlFor={`linkedin-url-${name}`} className="sr-only">LinkedIn URL for {name}</label>
        <input
          id={`linkedin-url-${name}`}
          type="text"
          readOnly
          value={url}
          onClick={(e) => e.currentTarget.select()}
          className="w-full rounded-2xl border border-ls-border bg-ls-surface-elevated px-4 py-3 text-ls-text text-sm sm:text-base outline-none focus:border-ls-border-strong focus:ring-1 focus:ring-ls-border-strong"
          title="Click to select the URL, then copy it manually"
        />
        <p className="mt-2 text-sm text-ls-text-muted">Click the field, press Ctrl/Cmd+C, then paste into a new tab.</p>
      </div>
    </div>
  );
}



export function TeamSection() {
  return (
    <section id="contact" className="bg-ls-surface relative z-10 px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32">
      <FadeIn>
        <h2 className="hero-heading text-center font-black uppercase tracking-tight" style={{ fontSize: "clamp(3rem, 12vw, 160px)", lineHeight: 1 }}>
          Contact
        </h2>
      </FadeIn>
      <p className="text-center mt-6 text-ls-text/70 max-w-2xl mx-auto" style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)" }}>
        Reach out directly to the Leadora leadership team.
      </p>

      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEAM.map((leader, i) => (
          <FadeIn key={leader.name} delay={i * 0.1} y={20}>
            <div className="h-full rounded-3xl border border-ls-border bg-ls-surface-elevated p-6 sm:p-8 md:p-10">
              <h3 className="text-ls-text font-black text-3xl sm:text-4xl md:text-5xl tracking-tight">{leader.name}</h3>
              <p className="text-ls-text-muted font-semibold uppercase tracking-widest text-sm mt-2">{leader.role}</p>

              <div className="mt-8 flex items-center gap-3">
                <a
                  href={`mailto:${leader.email}`}
                  className="text-ls-text underline underline-offset-4 decoration-ls-text/40 hover:decoration-ls-text transition-all"
                  style={{ fontSize: "clamp(1.05rem, 2vw, 1.35rem)" }}
                >
                  {leader.email}
                </a>
                <CopyEmail email={leader.email} />
              </div>

              <div className="mt-6">
                <CopyLinkedInUrl url={leader.linkedin} name={leader.name} />
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-16">
        <ContactForm />
      </div>
    </section>
  );
}


export function FooterSection() {
  return (
    <footer className="bg-ls-surface relative z-10 px-5 sm:px-8 md:px-10 py-12 sm:py-16 border-t border-ls-border">
      <FadeIn>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-ls-text/80 text-lg sm:text-xl md:text-2xl font-medium leading-relaxed">
            Thank you for stopping by. Ready to find your next client?
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-ls-text-muted uppercase tracking-wider text-xs sm:text-sm">
            <span>Leadora &copy; {new Date().getFullYear()}</span>
            <div className="flex gap-6">
              <a href="#features" className="hover:text-ls-text transition-colors">Features</a>
              <Link to="/hosting" className="hover:text-ls-text transition-colors">Hosting</Link>
              <Link to="/sell" className="hover:text-ls-text transition-colors">Sell</Link>
              <a href="#pricing" className="hover:text-ls-text transition-colors">Pricing</a>
              <Link to="/contact" className="hover:text-ls-text transition-colors">Contact</Link>
              <Link to="/auth" className="hover:text-ls-text transition-colors">Sign In</Link>
            </div>
          </div>
        </div>
      </FadeIn>
    </footer>
  );
}

