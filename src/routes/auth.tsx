import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Radar } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Leadora" },
      { name: "description", content: "Sign in or create your Leadora account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Account created! Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    // Plain Supabase OAuth — works the moment you enable the Google provider
    // in your Supabase project (Authentication -> Providers -> Google). No
    // extra service or API key needed beyond your own Supabase project.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      toast.error(error.message || "Google sign-in failed");
      setLoading(false);
      return;
    }
    // Supabase redirects the browser to Google itself, so there's nothing
    // else to do here — execution won't reach navigate() on success.
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--ls-surface)" }}>
      <div className="w-full max-w-md glass-card rounded-2xl p-8">
        <Link to="/" className="flex items-center gap-2 mb-8 text-ls-text">
          <Radar className="h-6 w-6 text-primary" />
          <span className="text-xl font-medium uppercase tracking-wider">Leadora</span>
        </Link>
        <h1 className="text-2xl font-semibold text-ls-text mb-1">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-ls-text-muted mb-6">
          {mode === "login" ? "Sign in to keep finding leads." : "Start with 20 free search credits."}
        </p>

        <Button type="button" variant="outline" className="w-full mb-4" onClick={onGoogle} disabled={loading}>
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 my-4 text-xs uppercase tracking-widest text-ls-text/40">
          <span className="h-px flex-1 bg-ls-surface-elevated" /> or <span className="h-px flex-1 bg-ls-surface-elevated" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-ls-text/80">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password" className="text-ls-text/80">Password</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-6 w-full text-sm text-ls-text-muted hover:text-ls-text"
        >
          {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
