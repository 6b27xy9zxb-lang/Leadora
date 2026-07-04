// Lightweight client-side error reporter.
// Swap the body of reportAppError for a real provider (Sentry, etc.) whenever you want one —
// this just logs to the console for now, with zero external dependency or API key required.
export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[App Error]", error, {
    route: window.location.pathname,
    ...context,
  });
}
