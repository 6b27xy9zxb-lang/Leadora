import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { searchLeads, saveLead, listLeads, updateLeadTags, bulkDeleteLeads } from "@/lib/leads.functions";
import { generateScript } from "@/lib/scripts.functions";
import { getProfile } from "@/lib/profile.functions";
import { toast } from "sonner";
import {
  Loader2, Phone, Star, Copy, RefreshCw, Check, Search as SearchIcon,
  AlertTriangle, Sparkles, Gem, X, Plus, Download, Trash2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { LeadsMap } from "@/components/leads/LeadsMap";


export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({ meta: [{ title: "Find Leads — Leadora" }] }),
  component: LeadsPage,
});

const CATEGORIES = ["Restaurant", "Plumber", "Salon", "Dentist", "Gym", "Bakery", "Auto Repair", "Florist", "Tattoo Studio", "Yoga Studio"];

type Lead = {
  business_name: string; category: string; city: string; phone: string;
  address: string; rating: number; review_count: number; has_website: boolean;
  osm_updated_at: string | null;
  lat: number | null; lng: number | null;
};

type SavedLead = {
  id: string;
  business_name: string;
  category: string | null;
  city: string | null;
  phone: string | null;
  address: string | null;
  rating: number | null;
  review_count: number | null;
  has_website: boolean;
  osm_updated_at: string | null;
  tags: string[];
  saved_at: string;
};

// ---- Helpers ----
function isRecentlyUpdated(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Date.now() - t <= 30 * 86400000;
}

function isHiddenGem(rating: number | null | undefined, reviews: number | null | undefined): boolean {
  return (rating ?? 0) >= 4.5 && (reviews ?? 0) < 50 && (reviews ?? 0) > 0;
}

/** 1–100 score from rating (0–5), review count (log-scaled), and OSM recency. */
function qualityScore(rating: number | null | undefined, reviews: number | null | undefined, osm: string | null | undefined): number {
  const r = Math.max(0, Math.min(5, rating ?? 0));
  const ratingScore = (r / 5) * 55; // 0..55
  const rc = Math.max(0, reviews ?? 0);
  const reviewScore = Math.min(1, Math.log10(rc + 1) / Math.log10(501)) * 30; // 0..30 (500+ reviews ≈ full)
  let recencyScore = 5;
  if (osm) {
    const days = (Date.now() - new Date(osm).getTime()) / 86400000;
    if (days <= 30) recencyScore = 15;
    else if (days <= 90) recencyScore = 11;
    else if (days <= 180) recencyScore = 8;
    else recencyScore = 5;
  }
  return Math.max(1, Math.min(100, Math.round(ratingScore + reviewScore + recencyScore)));
}

function scoreColor(score: number): string {
  if (score >= 80) return "#10B981"; // emerald
  if (score >= 60) return "#22C55E"; // green
  if (score >= 40) return "#F59E0B"; // amber
  return "#EF4444"; // red
}

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = scoreColor(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} title={`Quality score: ${score}/100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--ls-border)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[11px] font-bold text-ls-text">{score}</div>
    </div>
  );
}

function RecencyBadge() {
  return (
    <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30 gap-1">
      <Sparkles className="h-3 w-3" /> Recently Updated
    </Badge>
  );
}

function HiddenGemBadge() {
  return (
    <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 gap-1">
      <Gem className="h-3 w-3" /> Hidden Gem
    </Badge>
  );
}

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCSV(rows: SavedLead[]) {
  const headers = ["business_name", "category", "city", "phone", "address", "rating", "review_count", "has_website", "tags", "saved_at"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push([
      r.business_name, r.category, r.city, r.phone, r.address,
      r.rating, r.review_count, r.has_website ? "yes" : "no",
      (r.tags ?? []).join(" | "), r.saved_at,
    ].map(csvEscape).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leadora-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---- Tag editor for a saved lead ----
function TagEditor({ lead, onSave }: { lead: SavedLead; onSave: (tags: string[]) => Promise<void> | void }) {
  const [tags, setTags] = useState<string[]>(lead.tags ?? []);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);

  async function commit(next: string[]) {
    setSaving(true);
    try { await onSave(next); } finally { setSaving(false); }
  }

  function addTag() {
    const t = input.trim();
    if (!t) return;
    if (tags.includes(t)) { setInput(""); return; }
    const next = [...tags, t].slice(0, 20);
    setTags(next);
    setInput("");
    void commit(next);
  }

  function removeTag(t: string) {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    void commit(next);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
    else if (e.key === "Backspace" && !input && tags.length) { removeTag(tags[tags.length - 1]); }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-ls-surface-elevated border border-ls-border-strong text-ls-text text-xs px-2 py-0.5">
          {t}
          <button type="button" aria-label={`Remove ${t}`} onClick={() => removeTag(t)} className="opacity-60 hover:opacity-100">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <div className="inline-flex items-center gap-1">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Add tag…"
          className="h-7 w-32 text-xs bg-transparent"
        />
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={addTag} disabled={!input.trim() || saving}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
        </Button>
      </div>
    </div>
  );
}

function LeadsPage() {
  const qc = useQueryClient();
  const searchFn = useServerFn(searchLeads);
  const saveFn = useServerFn(saveLead);
  const profileFn = useServerFn(getProfile);
  const scriptFn = useServerFn(generateScript);
  const listFn = useServerFn(listLeads);
  const updateTagsFn = useServerFn(updateLeadTags);
  const bulkDeleteFn = useServerFn(bulkDeleteLeads);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const savedLeads = useQuery({ queryKey: ["leads"], queryFn: () => listFn() });
  const savedRows: SavedLead[] = useMemo(
    () => (savedLeads.data ?? []).map((l) => ({ ...l, tags: (l as { tags?: string[] }).tags ?? [] })) as SavedLead[],
    [savedLeads.data],
  );
  const savedKeys = new Set(savedRows.map((l) => `${l.business_name}|${l.address ?? ""}`));
  const outOfCredits = false; // Demo mode

  const [city, setCity] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [minRating, setMinRating] = useState(0);
  const [filter, setFilter] = useState<"all" | "no_website" | "has_website">("all");
  const [results, setResults] = useState<Lead[] | null>(null);

  const search = useMutation({
    mutationFn: (v: { city: string; category: string; minRating: number }) => searchFn({ data: v }),
    onSuccess: (r) => {
      setResults(r.results);
      qc.invalidateQueries({ queryKey: ["profile"] });
      if (r.mock) toast.info("Showing sample data — add GOOGLE_PLACES_API_KEY for real results.");
      else toast.success(`${r.results.length} leads found`, { description: `${r.remainingCredits} search credits remaining.` });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Search failed"),
  });

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: (lead: Lead) => saveFn({ data: lead }),
    onMutate: (lead) => { setSavingKey(`${lead.business_name}|${lead.address ?? ""}`); },
    onSuccess: () => {
      toast.success("Lead saved!");
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
    onSettled: () => setSavingKey(null),
  });

  // Multi-select state for saved leads
  const [selected, setSelected] = useState<Set<string>>(new Set());
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function selectAll() {
    setSelected(new Set(savedRows.map((r) => r.id)));
  }
  function clearSelection() { setSelected(new Set()); }

  const bulkDelete = useMutation({
    mutationFn: (ids: string[]) => bulkDeleteFn({ data: { ids } }),
    onSuccess: (r) => {
      toast.success(`Deleted ${r.deleted} lead${r.deleted === 1 ? "" : "s"}`);
      clearSelection();
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  async function saveTags(id: string, tags: string[]) {
    try {
      await updateTagsFn({ data: { id, tags } });
      qc.invalidateQueries({ queryKey: ["leads"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Tag update failed");
    }
  }

  function exportSelected() {
    const rows = savedRows.filter((r) => selected.has(r.id));
    if (!rows.length) return;
    downloadCSV(rows);
    toast.success(`Exported ${rows.length} lead${rows.length === 1 ? "" : "s"} to CSV`);
  }

  const [scriptModal, setScriptModal] = useState<Lead | null>(null);
  const [scriptType, setScriptType] = useState<"cold_call" | "ai_prompt">("cold_call");
  const [scriptContent, setScriptContent] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function runScript(lead: Lead, type: "cold_call" | "ai_prompt") {
    setScriptLoading(true);
    setScriptContent("");
    try {
      const res = await scriptFn({ data: {
        businessName: lead.business_name, category: lead.category, city: lead.city,
        phone: lead.phone, rating: lead.rating, type,
      } });
      setScriptContent(res.content);
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Script generated", { description: `${res.remainingCredits} script credits remaining.` });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setScriptLoading(false);
    }
  }

  function copyScript() {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 1800);
  }

  const filtered = (results ?? []).filter((r) =>
    filter === "all" ? true : filter === "no_website" ? !r.has_website : r.has_website
  );

  const credits = profile.data?.search_credits ?? 0;
  const lowCredits = credits > 0 && credits < 5;

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl">
      <h1 className="text-2xl sm:text-3xl font-semibold text-ls-text mb-6">Find leads</h1>

      {lowCredits && (
        <div className="mb-4 flex items-center gap-3 text-sm bg-yellow-500/15 border border-yellow-500/40 text-yellow-100 rounded-lg px-4 py-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-400" />
          <span className="font-medium">⚠️ Only {credits} search credits remaining.</span>
          <Link to="/billing" className="underline ml-auto font-medium hover:text-yellow-300">Upgrade your plan</Link>
        </div>
      )}
      {outOfCredits && (
        <div className="mb-4 flex items-center gap-3 text-sm bg-red-500/15 border border-red-500/40 text-red-100 rounded-lg px-4 py-3 shadow-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          <span className="font-medium">❌ You're out of search credits. Upgrade to search more.</span>
          <Link to="/billing" className="underline ml-auto font-medium hover:text-red-300">Upgrade now</Link>
        </div>
      )}

      <Card className="p-4 sm:p-5 bg-card border-ls-border">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-[2fr_1.5fr_1fr_auto] md:items-end">
          <div>
            <Label className="text-ls-text/70">City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Austin, TX" className="mt-1" />
          </div>
          <div>
            <Label className="text-ls-text/70">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-ls-text/70">Min rating</Label>
            <Input type="number" min={0} max={5} step={0.5} value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))} className="mt-1" />
          </div>
          <Button
            disabled={!city || search.isPending || outOfCredits}
            onClick={() => search.mutate({ city, category, minRating })}
            className="w-full md:w-auto"
          >
            {search.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Search leads
          </Button>
        </div>
        <div className="mt-3 text-xs border-ls-border/500">
          Credits: <span className="text-ls-text">{profile.data?.search_credits ?? "—"}</span> search · {profile.data?.script_credits ?? "—"} script
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", "no_website", "has_website"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "no_website" ? "No website" : "Has website"}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="list" className="mt-4">
        <TabsList>
          <TabsTrigger value="list">List view</TabsTrigger>
          <TabsTrigger value="map">Map view</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <div className="grid gap-3">
            {search.isPending && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 bg-ls-surface-elevated" />)}
            {!search.isPending && results === null && (
              <div className="text-center py-16 px-4 border border-dashed border-ls-border rounded-xl">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 grid place-items-center mb-4">
                  <SearchIcon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-ls-text font-medium">Enter a city and business type to find leads</div>
                <div className="text-sm border-ls-border/500 mt-1">We'll surface local businesses without a website first.</div>
                <Button className="mt-5" disabled={!city || outOfCredits || search.isPending}
                  onClick={() => search.mutate({ city, category, minRating })}>
                  Search leads
                </Button>
              </div>
            )}
            {!search.isPending && results !== null && filtered.length === 0 && (
              <div className="text-center py-12 px-4 border border-dashed border-ls-border rounded-xl">
                <div className="text-ls-text font-medium">No businesses found in this area</div>
                <div className="text-sm border-ls-border/500 mt-1">Try a different city or category.</div>
              </div>
            )}

            {filtered.map((l, i) => {
              const score = qualityScore(l.rating, l.review_count, l.osm_updated_at);
              const recent = isRecentlyUpdated(l.osm_updated_at);
              const gem = isHiddenGem(l.rating, l.review_count);
              return (
                <Card key={i} className="p-5 bg-card border-ls-border flex flex-col md:flex-row md:items-center gap-4">
                  <ScoreRing score={score} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-ls-text font-semibold text-lg">{l.business_name}</h3>
                      <Badge variant="outline" className="text-ls-text/80">{l.category}</Badge>
                      {l.has_website
                        ? <Badge variant="secondary">Has website</Badge>
                        : <Badge className="bg-destructive/20 text-destructive-foreground border-destructive/30">No website detected</Badge>}
                      {recent && <RecencyBadge />}
                      {gem && <HiddenGemBadge />}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-ls-text-muted flex-wrap">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-current text-yellow-400" /> {l.rating?.toFixed(1)} ({l.review_count})</span>
                      {l.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {l.phone}</span>}
                      <span>{l.address}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(() => {
                      const key = `${l.business_name}|${l.address ?? ""}`;
                      const isSaved = savedKeys.has(key);
                      const isSaving = savingKey === key;
                      return (
                        <Button size="sm" onClick={() => save.mutate(l)} disabled={isSaved || isSaving || save.isPending}>
                          {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {isSaved ? "Saved" : isSaving ? "Saving…" : "Save"}
                        </Button>
                      );
                    })()}
                    <Button size="sm" variant="outline" disabled={scriptLoading}
                      onClick={() => { setScriptModal(l); setScriptType("cold_call"); setScriptContent(""); runScript(l, "cold_call"); }}>
                      {scriptLoading && scriptModal?.business_name === l.business_name
                        ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        : null}
                      Generate script
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <LeadsMap leads={filtered} />
        </TabsContent>
      </Tabs>


      {/* Saved leads section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-xl font-semibold text-ls-text">Saved leads <span className="text-ls-text/40 text-sm font-normal">({savedRows.length})</span></h2>
          {savedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={selected.size === savedRows.length ? clearSelection : selectAll}>
                {selected.size === savedRows.length ? "Deselect all" : "Select all"}
              </Button>
            </div>
          )}
        </div>

        {selected.size > 0 && (
          <div className="sticky top-2 z-20 mb-3 flex items-center gap-3 flex-wrap rounded-lg border border-primary/40 bg-primary/10 backdrop-blur px-4 py-2.5">
            <span className="text-sm text-ls-text font-medium">{selected.size} selected</span>
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" onClick={exportSelected}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Export selected to CSV
              </Button>
              <Button size="sm" variant="destructive" onClick={() => bulkDelete.mutate(Array.from(selected))} disabled={bulkDelete.isPending}>
                {bulkDelete.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
                Delete selected
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
            </div>
          </div>
        )}

        {savedLeads.isLoading ? (
          <div className="grid gap-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 bg-ls-surface-elevated" />)}
          </div>
        ) : savedRows.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-ls-border rounded-xl border-ls-border/500 text-sm">
            Save a lead from your search to start building your list.
          </div>
        ) : (
          <div className="grid gap-2">
            {savedRows.map((l) => {
              const score = qualityScore(l.rating, l.review_count, l.osm_updated_at);
              const recent = isRecentlyUpdated(l.osm_updated_at);
              const gem = isHiddenGem(l.rating, l.review_count);
              const checked = selected.has(l.id);
              return (
                <Card key={l.id} className={`p-4 bg-card border-ls-border flex flex-col md:flex-row md:items-center gap-3 ${checked ? "ring-1 ring-primary/60" : ""}`}>
                  <Checkbox checked={checked} onCheckedChange={() => toggleSelect(l.id)} aria-label={`Select ${l.business_name}`} />
                  <ScoreRing score={score} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-ls-text font-medium">{l.business_name}</h3>
                      {l.category && <Badge variant="outline" className="text-ls-text/70 text-[10px]">{l.category}</Badge>}
                      {!l.has_website && <Badge className="bg-destructive/20 text-destructive-foreground border-destructive/30 text-[10px]">No website</Badge>}
                      {recent && <RecencyBadge />}
                      {gem && <HiddenGemBadge />}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs border-ls-border/500 flex-wrap">
                      {typeof l.rating === "number" && (
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-current text-yellow-400" /> {l.rating?.toFixed(1)} ({l.review_count ?? 0})</span>
                      )}
                      {l.city && <span>{l.city}</span>}
                    </div>
                    <div className="mt-2">
                      <TagEditor lead={l} onSave={(tags) => saveTags(l.id, tags)} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!scriptModal} onOpenChange={(o) => !o && setScriptModal(null)}>
        <DialogContent className="!left-4 !right-4 !top-4 !bottom-4 !inset-x-4 !inset-y-4 !translate-x-0 !translate-y-0 !w-auto !max-w-[calc(100vw-2rem)] sm:!max-w-2xl sm:!left-1/2 sm:!top-1/2 sm:!right-auto sm:!bottom-auto sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:!w-[calc(100vw-2rem)] !max-h-[calc(100vh-2rem)] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>{scriptModal?.business_name}</DialogTitle>
          </DialogHeader>
          <Tabs value={scriptType} onValueChange={(v) => { const t = v as "cold_call" | "ai_prompt"; setScriptType(t); if (scriptModal) runScript(scriptModal, t); }} className="flex flex-col min-h-0">
            <TabsList>
              <TabsTrigger value="cold_call">Cold call script</TabsTrigger>
              <TabsTrigger value="ai_prompt">AI builder prompt</TabsTrigger>
            </TabsList>
            <TabsContent value={scriptType} className="mt-4">
              {scriptLoading ? (
                <div className="h-48 flex items-center justify-center text-ls-text-muted gap-1">
                  <span>Generating</span>
                  <span className="inline-flex gap-1 ml-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-ls-surface-elevated/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-ls-surface-elevated/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-ls-surface-elevated/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              ) : (
                <Textarea value={scriptContent} onChange={(e) => setScriptContent(e.target.value)} className="min-h-[240px] max-h-[50vh]" />
              )}
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={copyScript} disabled={!scriptContent}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => scriptModal && runScript(scriptModal, scriptType)} disabled={scriptLoading}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
