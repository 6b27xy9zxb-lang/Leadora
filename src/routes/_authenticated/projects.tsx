import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { listProjects, createProject, updateProjectStatus, getProjectViews } from "@/lib/projects.functions";
import { toast } from "sonner";
import { Plus, Link2, BarChart3, GripVertical, X, FolderKanban, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

export const Route = createFileRoute("/_authenticated/projects")({
  head: () => ({ meta: [{ title: "Projects — Leadora" }] }),
  component: ProjectsPage,
});

type Status = "new" | "contacted" | "preview_sent" | "closed";
const COLUMNS: { id: Status; label: string; emoji: string }[] = [
  { id: "new", label: "New lead", emoji: "🆕" },
  { id: "contacted", label: "Contacted", emoji: "📞" },
  { id: "preview_sent", label: "Preview sent", emoji: "👁️" },
  { id: "closed", label: "Closed", emoji: "✅" },
];
const CATEGORIES = ["Restaurant", "Plumber", "Salon", "Dentist", "Gym", "Bakery", "Auto Repair", "Florist", "Tattoo Studio", "Yoga Studio", "Other"];

type Project = {
  id: string; business_name: string; category: string | null; city: string | null;
  phone: string | null; status: string; preview_token: string; created_at: string;
};

function daysAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const d = Math.floor(ms / 86400000);
  if (d <= 0) {
    const h = Math.floor(ms / 3600000);
    if (h <= 0) return "just now";
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

function categoryColor(category: string | null) {
  if (!category) return "bg-ls-surface-elevated text-ls-text/70 border-ls-border-strong";
  const palette = [
    "bg-rose-500/15 text-rose-300 border-rose-500/30",
    "bg-amber-500/15 text-amber-300 border-amber-500/30",
    "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    "bg-sky-500/15 text-sky-300 border-sky-500/30",
    "bg-violet-500/15 text-violet-300 border-violet-500/30",
    "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    "bg-lime-500/15 text-lime-300 border-lime-500/30",
  ];
  let h = 0;
  for (let i = 0; i < category.length; i++) h = (h * 31 + category.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

function ProjectCard({ p, onCopy, onStats, dragging }: {
  p: Project; onCopy: () => void; onStats: () => void; dragging?: boolean;
}) {
  return (
    <Card className={`p-4 bg-card border-ls-border ${dragging ? "shadow-2xl ring-1 ring-white/20" : ""}`}>
      <div className="flex items-start gap-2">
        <div className="text-ls-text/30 hover:text-ls-text-muted cursor-grab active:cursor-grabbing pt-0.5" title="Drag">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ls-text truncate">{p.business_name}</div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            {p.category && (
              <Badge variant="outline" className={categoryColor(p.category)}>{p.category}</Badge>
            )}
            {p.city && <span className="text-xs border-ls-border/500">{p.city}</span>}
          </div>
          <div className="mt-1 text-xs text-ls-text/40">{daysAgo(p.created_at)}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onPointerDown={(e) => e.stopPropagation()} onClick={onCopy}>
              <Link2 className="h-3 w-3 mr-1" /> Send preview
            </Button>
            <Button size="sm" variant="ghost" onPointerDown={(e) => e.stopPropagation()} onClick={onStats}>
              <BarChart3 className="h-3 w-3 mr-1" /> View stats
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function DraggableCard({ p, children }: { p: Project; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: p.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`touch-none transition-opacity ${isDragging ? "opacity-30" : "opacity-100"}`}
    >
      {children}
    </div>
  );
}

function DroppableColumn({ id, children, count, label, emoji }: {
  id: Status; children: React.ReactNode; count: number; label: string; emoji: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div className="min-w-[260px]">
      <div className="flex items-center justify-between mb-3 text-sm uppercase tracking-wider text-ls-text-muted">
        <span>{emoji} {label}</span>
        <span className="text-ls-text/40">{count}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[120px] rounded-lg p-2 transition-colors ${
          isOver ? "bg-ls-surface-elevated/[0.06] ring-1 ring-white/20" : "bg-transparent"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function ProjectsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listProjects);
  const createFn = useServerFn(createProject);
  const updateFn = useServerFn(updateProjectStatus);
  const viewsFn = useServerFn(getProjectViews);

  const { data: projects, isLoading: projectsLoading } = useQuery({ queryKey: ["projects"], queryFn: () => listFn() });
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ business_name: "", category: CATEGORIES[0], city: "", phone: "", notes: "" });
  const [drawer, setDrawer] = useState<Project | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: views, isLoading: viewsLoading } = useQuery({
    queryKey: ["views", drawer?.id], queryFn: () => drawer ? viewsFn({ data: { id: drawer.id } }) : Promise.resolve([]),
    enabled: !!drawer,
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const create = useMutation({
    mutationFn: () => createFn({ data: form }),
    onSuccess: () => {
      toast.success("Project created!");
      setOpen(false);
      setForm({ business_name: "", category: CATEGORIES[0], city: "", phone: "", notes: "" });
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Create failed"),
  });

  function copyPreviewLink(token: string) {
    const url = `${window.location.origin}/preview/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Preview link copied!");
  }


  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const projectId = String(e.active.id);
    const newStatus = e.over?.id as Status | undefined;
    if (!newStatus) return;
    const project = (projects ?? []).find((p) => p.id === projectId);
    if (!project || project.status === newStatus) return;

    // optimistic
    qc.setQueryData<Project[]>(["projects"], (prev) =>
      (prev ?? []).map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)),
    );
    const colLabel = COLUMNS.find((c) => c.id === newStatus)?.label ?? newStatus;
    try {
      await updateFn({ data: { id: projectId, status: newStatus } });
      toast.success(`Project moved to ${colLabel}!`);
    } catch (err) {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.error(err instanceof Error ? err.message : "Move failed");
    }
  }

  const filtered = (projects ?? []).filter((p) =>
    p.business_name.toLowerCase().includes(search.toLowerCase())
  );
  const activeProject = activeId ? (projects ?? []).find((p) => p.id === activeId) ?? null : null;

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-6 sm:flex sm:flex-wrap sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold text-ls-text truncate">Projects</h1>
        <div className="col-span-2 flex gap-2 sm:col-span-1">
          <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 sm:w-56" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">New project</span></Button></DialogTrigger>

            <DialogContent>
              <DialogHeader><DialogTitle>New project</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-ls-text/70">Business name</Label>
                  <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
                </div>
                <div>
                  <Label className="text-ls-text/70">Category</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full bg-background border border-ls-border rounded-md px-3 py-2 text-sm text-ls-text"
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-ls-text/70">City</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <Label className="text-ls-text/70">Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <Label className="text-ls-text/70">Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => create.mutate()} disabled={!form.business_name || create.isPending}>
                  {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {create.isPending ? "Creating…" : "Create project"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {projectsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.id}>
              <div className="text-sm uppercase tracking-wider text-ls-text-muted mb-3">{col.emoji} {col.label}</div>
              <div className="space-y-2">
                <Skeleton className="h-24 w-full bg-ls-surface-elevated" />
                <Skeleton className="h-24 w-full bg-ls-surface-elevated" />
              </div>
            </div>
          ))}
        </div>
      ) : (projects?.length ?? 0) === 0 ? (
        <div className="text-center py-20 px-4 border border-dashed border-ls-border rounded-xl">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 grid place-items-center mb-4">
            <FolderKanban className="h-7 w-7 text-primary" />
          </div>
          <div className="text-ls-text font-medium">No projects yet</div>
          <div className="text-sm border-ls-border/500 mt-1">Save a lead and create your first project!</div>
          <Button asChild className="mt-5"><Link to="/leads">Find leads</Link></Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
          onDragCancel={() => setActiveId(null)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex md:grid gap-4 md:grid-cols-2 xl:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none overscroll-x-contain scroll-px-4 -mx-4 px-4 md:mx-0 md:px-0 pb-2 [scrollbar-width:thin]">
            {COLUMNS.map((col) => {
              const items = filtered.filter((p) => p.status === col.id);
              return (
                <div key={col.id} className="snap-start shrink-0 w-[85vw] sm:w-72 md:w-auto">
                  <DroppableColumn id={col.id} count={items.length} label={col.label} emoji={col.emoji}>
                    {items.map((p) => (
                      <DraggableCard key={p.id} p={p}>
                        <ProjectCard p={p} onCopy={() => copyPreviewLink(p.preview_token)} onStats={() => setDrawer(p)} />
                      </DraggableCard>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center text-xs text-ls-text/30 py-6 border border-dashed border-ls-border rounded-lg">
                        Drop here
                      </div>
                    )}
                  </DroppableColumn>
                </div>
              );
            })}
          </div>
          <DragOverlay>
            {activeProject && (
              <ProjectCard p={activeProject} onCopy={() => {}} onStats={() => {}} dragging />
            )}
          </DragOverlay>
        </DndContext>
      )}


      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="bg-card border-ls-border text-ls-text w-full sm:max-w-[420px]">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle className="text-ls-text">{drawer?.business_name}</SheetTitle>
            <button onClick={() => setDrawer(null)} className="text-ls-text-muted hover:text-ls-text">
              <X className="h-4 w-4" />
            </button>
          </SheetHeader>
          {drawer && viewsLoading ? (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-16 w-full bg-ls-surface-elevated" />
                <Skeleton className="h-16 w-full bg-ls-surface-elevated" />
                <Skeleton className="h-16 w-full bg-ls-surface-elevated" />
              </div>
              <Skeleton className="h-40 w-full bg-ls-surface-elevated" />
            </div>
          ) : drawer && (() => {
            const total = views?.length ?? 0;
            const unique = new Set((views ?? []).map((v) => new Date(v.viewed_at).toDateString())).size;
            const ctas = (views ?? []).filter((v) => v.is_cta_clicked).length;
            return (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3 bg-ls-surface-elevated border-ls-border">
                    <div className="text-xs text-ls-text-muted">Total views</div>
                    <div className="text-3xl font-semibold">{total}</div>
                  </Card>
                  <Card className="p-3 bg-ls-surface-elevated border-ls-border">
                    <div className="text-xs text-ls-text-muted">Unique</div>
                    <div className="text-3xl font-semibold">{unique}</div>
                  </Card>
                  <Card className="p-3 bg-ls-surface-elevated border-ls-border">
                    <div className="text-xs text-ls-text-muted">CTA clicks</div>
                    <div className="text-3xl font-semibold">{ctas}</div>
                  </Card>
                </div>
                <div>
                  <div className="text-xs text-ls-text-muted uppercase tracking-wider mb-2">Timeline</div>
                  <div className="space-y-1 max-h-80 overflow-auto">
                    {(views ?? []).map((v) => {
                      const d = new Date(v.viewed_at);
                      return (
                        <div key={v.id} className="text-xs text-ls-text/70 flex justify-between border-b border-ls-border py-1.5">
                          <span>{v.is_cta_clicked ? "🎯 CTA click" : "👁 Viewed preview"}</span>
                          <span>{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      );
                    })}
                    {(views ?? []).length === 0 && <div className="text-xs text-ls-text/40">No views yet</div>}
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => copyPreviewLink(drawer.preview_token)}>Copy preview link</Button>
              </div>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
