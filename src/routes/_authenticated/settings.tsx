import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getProfile, updateProfile, deleteAccount } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Leadora" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const profileFn = useServerFn(getProfile);
  const updateFn = useServerFn(updateProfile);
  const deleteFn = useServerFn(deleteAccount);
  const { data } = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });

  const [username, setUsername] = useState("");
  useEffect(() => { if (data?.username) setUsername(data.username); }, [data?.username]);

  const update = useMutation({
    mutationFn: (v: string) => updateFn({ data: { username: v } }),
    onSuccess: () => { toast.success("Profile updated!"); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const del = useMutation({
    mutationFn: () => deleteFn(),
    onSuccess: async () => {
      toast.success("Account deleted", { description: "You have been signed out. We're sorry to see you go!" });
      await supabase.auth.signOut();
      qc.clear();
      navigate({ to: "/", replace: true });
    },
    onError: (e) => toast.error("Account deletion failed", {
      description: e instanceof Error ? e.message : "Please try again or contact support.",
    }),
  });

  return (
    <div className="p-6 md:p-10 max-w-2xl pb-24 md:pb-10">
      <h1 className="text-3xl font-semibold text-ls-text mb-6">Settings</h1>

      <Card className="p-6 bg-card border-ls-border space-y-4">
        <div>
          <Label className="text-ls-text/70">Display name</Label>
          <div className="mt-1 flex gap-2">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" />
            <Button onClick={() => update.mutate(username)} disabled={!username || update.isPending}>
              {update.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
        <Row label="Email" value={data?.email ?? "—"} />
        <Row label="Member since" value={data?.created_at ? new Date(data.created_at).toLocaleDateString() : "—"} />
      </Card>

      <Card className="mt-6 p-6 bg-card border-ls-border">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xs border-ls-border/500 uppercase tracking-wider">Current plan</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="text-ls-text text-sm uppercase">{data?.plan ?? "free"}</Badge>
              <span className="text-sm text-ls-text-muted">
                {data?.search_credits ?? 0} search · {data?.script_credits ?? 0} script credits
              </span>
            </div>
          </div>
          <Button asChild><Link to="/billing">Upgrade plan</Link></Button>
        </div>
      </Card>

      <Card className="mt-6 p-6 bg-destructive/5 border-destructive/30">
        <div className="text-sm uppercase tracking-wider text-destructive-foreground/80 font-medium">Danger zone</div>
        <p className="mt-2 text-sm text-ls-text-muted">
          Permanently delete your account, leads, projects, and generated scripts. This action cannot be undone.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4">Delete account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your profile, all saved leads, projects, and scripts.
                You will be signed out immediately. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => { e.preventDefault(); del.mutate(); }}
                disabled={del.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {del.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Delete forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm border-b border-ls-border pb-2">
      <span className="text-ls-text-muted">{label}</span><span className="text-ls-text">{value}</span>
    </div>
  );
}
