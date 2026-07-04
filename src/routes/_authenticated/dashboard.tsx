import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/profile.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Search, FolderKanban, FileText, Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Leadora" }] }),
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(getDashboardStats);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => fn() });
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const name = data?.profile?.username ?? "there";

  const searchPct = data?.profile ? Math.round(((data.profile.search_credits) / Math.max(1, data.profile.search_credits + 1)) * 100) : 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl">
      <h1 className="text-3xl md:text-4xl font-semibold text-ls-text">
        {greeting}, {name} <span className="inline-block">👋</span>
      </h1>
      <p className="text-ls-text-muted mt-1">Here's where things stand.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Total leads saved" value={data?.leadCount ?? 0} loading={isLoading} />
        <StatCard icon={Sparkles} label="AI scripts" value={data?.scriptCount ?? 0} loading={isLoading} />
        <StatCard icon={FolderKanban} label="Projects active" value={data?.projectCount ?? 0} loading={isLoading} />
        <Card className="p-5 bg-card border-ls-border">
          <div className="flex items-center justify-between text-sm text-ls-text-muted">
            <span>Search credits</span>
            <Search className="h-4 w-4" />
          </div>
          <div className="text-2xl font-semibold text-ls-text mt-2">
            {data?.profile?.search_credits ?? "—"}
          </div>
          <Progress value={searchPct} className="mt-3 h-1.5" />
        </Card>
      </div>

      <div className="mt-8 flex gap-3">
        <Button asChild><Link to="/leads">Find new leads</Link></Button>
        <Button asChild variant="outline"><Link to="/projects">View projects</Link></Button>
      </div>

      <h2 className="mt-12 text-lg font-medium text-ls-text">Recent leads</h2>
      <Card className="mt-4 overflow-hidden border-ls-border">
        <table className="w-full text-sm">
          <thead className="bg-ls-surface-elevated text-ls-text-muted">
            <tr>
              <th className="text-left p-3 font-normal">Business</th>
              <th className="text-left p-3 font-normal">Category</th>
              <th className="text-left p-3 font-normal">City</th>
              <th className="text-left p-3 font-normal">Rating</th>
              <th className="text-left p-3 font-normal">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(data?.recentLeads ?? []).map((l) => (
              <tr key={l.id} className="border-t border-ls-border">
                <td className="p-3 text-ls-text">{l.business_name}</td>
                <td className="p-3 text-ls-text/70">{l.category}</td>
                <td className="p-3 text-ls-text/70">{l.city}</td>
                <td className="p-3 text-ls-text/70">{l.rating?.toFixed(1) ?? "—"}</td>
                <td className="p-3">
                  {l.has_website
                    ? <Badge variant="secondary">Has website</Badge>
                    : <Badge className="bg-destructive/20 text-destructive-foreground border-destructive/30">No website</Badge>}
                </td>
                <td className="p-3"><ArrowRight className="h-4 w-4 text-ls-text/40" /></td>
              </tr>
            ))}
            {!isLoading && (data?.recentLeads ?? []).length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center border-ls-border/500">No leads yet — head to Find Leads to get started.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, loading }: { icon: React.ComponentType<{className?:string}>; label: string; value: number | string; loading?: boolean }) {
  return (
    <Card className="p-5 bg-card border-ls-border">
      <div className="flex items-center justify-between text-sm text-ls-text-muted">
        <span>{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-semibold text-ls-text mt-2">{loading ? "…" : value}</div>
    </Card>
  );
}
