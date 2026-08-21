import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { getPreview, trackCtaClick } from "@/lib/preview.functions";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, MapPin, Mail, CheckCircle2, Sparkles, ShieldCheck, Clock } from "lucide-react";

export const Route = createFileRoute("/preview/$token")({
  head: () => ({
    meta: [
      { title: "Your new website preview" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  const { token } = Route.useParams();
  const fn = useServerFn(getPreview);
  const ctaFn = useServerFn(trackCtaClick);
  const { data, isLoading } = useQuery({
    queryKey: ["preview", token],
    queryFn: () => fn({ data: { token } }),
  });
  const [claimed, setClaimed] = useState(false);
  const claim = useMutation({
    mutationFn: () => ctaFn({ data: { token } }),
    onSuccess: () => setClaimed(true),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-700">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-700">
        Preview not found.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Top claim banner */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-ls-text">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[220px]">
            {claimed ? (
              <div className="flex items-center gap-2 text-ls-text">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Thank you! We'll contact you shortly.</span>
              </div>
            ) : (
              <>
                <div className="font-semibold">
                  This website was designed for {data.business_name}
                </div>
                <div className="text-sm opacity-90">
                  🎯 Is this your business? Claim it today!
                </div>
              </>
            )}
          </div>
          {!claimed && (
            <Button
              onClick={() => claim.mutate()}
              disabled={claim.isPending}
              className="bg-white text-indigo-700 hover:bg-ls-surface-elevated/90 font-bold shadow-md"
            >
              {claim.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim Now"}
            </Button>
          )}
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        {data.category && (
          <div className="text-xs uppercase tracking-[0.2em] text-indigo-600 font-semibold">
            {data.category}
          </div>
        )}
        <h1 className="mt-3 text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
          {data.business_name}
        </h1>
        <p className="mt-5 text-lg text-slate-600 max-w-2xl">
          Trusted by locals{data.city ? ` in ${data.city}` : ""}. Quality work, real reviews, and a team that shows up.
        </p>
        <div className="mt-8 flex flex-wrap gap-6 text-slate-700">
          {data.phone && (
            <div className="flex items-center gap-2">
              <span aria-hidden>📞</span>
              <span className="font-medium">{data.phone}</span>
            </div>
          )}
          {data.city && (
            <div className="flex items-center gap-2">
              <span aria-hidden>📍</span>
              <span className="font-medium">{data.city}</span>
            </div>
          )}
        </div>
        <div className="mt-8 flex gap-3">
          <Button
            size="lg"
            onClick={() => claim.mutate()}
            className="bg-indigo-600 hover:bg-indigo-700 text-ls-text"
          >
            Get a free consultation
          </Button>
          {data.phone && (
            <Button size="lg" variant="outline" className="border-slate-300 text-slate-800">
              <Phone className="h-4 w-4 mr-2" /> Call now
            </Button>
          )}
        </div>
      </section>

      {/* Services */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-slate-900">Our Services</h2>
          <p className="mt-2 text-slate-600">What we do best.</p>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {[
              { icon: Sparkles, title: "Quality you can see", body: "Premium craftsmanship on every job, big or small." },
              { icon: ShieldCheck, title: "Fully insured", body: "Peace of mind on every visit — licensed and bonded." },
              { icon: Clock, title: "On-time, every time", body: "We respect your schedule and arrive when promised." },
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-semibold text-slate-900">{c.title}</div>
                <div className="mt-1 text-sm text-slate-600">{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Contact Us</h2>
            <p className="mt-2 text-slate-600">
              Send a message and we'll get back to you within one business day.
            </p>
            <div className="mt-6 space-y-3 text-slate-700">
              {data.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-indigo-600" /> {data.phone}
                </div>
              )}
              {data.city && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-indigo-600" /> {data.city}
                </div>
              )}
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-indigo-600" /> hello@{data.business_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com
              </div>
            </div>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); claim.mutate(); }}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3"
          >
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Message</label>
              <textarea rows={4} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="How can we help?" />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-ls-text">
              Send message
            </Button>
          </form>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span className="h-5 w-5 rounded bg-indigo-600 text-ls-text flex items-center justify-center font-bold text-[10px]">L</span>
          Powered by <span className="font-semibold text-slate-700">Leadora</span>
        </div>
      </footer>
    </main>
  );
}
