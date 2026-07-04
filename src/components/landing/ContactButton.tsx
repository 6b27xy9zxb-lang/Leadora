import { Link } from "@tanstack/react-router";

export function ContactButton({ label = "Get Started", to = "/auth" }: { label?: string; to?: string }) {
  return (
    <Link
      to={to}
      className="btn-gradient inline-flex items-center justify-center rounded-full px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base font-medium uppercase tracking-widest text-ls-text transition-transform hover:scale-[1.02]"
    >
      {label}
    </Link>
  );
}
