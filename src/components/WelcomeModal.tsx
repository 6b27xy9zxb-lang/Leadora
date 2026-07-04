import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const REFERRAL_OPTIONS = [
  "Google Search",
  "Twitter/X",
  "LinkedIn",
  "Friend/Referral",
  "Other",
] as const;

export function WelcomeModal({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["welcome-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("onboarded_at, full_name")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [referral, setReferral] = useState<string>("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile && !profile.onboarded_at) setOpen(true);
  }, [profile]);

  if (!profile || profile.onboarded_at) return null;

  const canSubmit = name.trim().length > 0 && agreed && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name.trim(),
        referral_source: referral || null,
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", userId);
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't save your details. Please try again.");
      return;
    }
    toast.success(`Welcome aboard, ${name.trim()}!`);
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["welcome-profile", userId] });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (profile?.onboarded_at) setOpen(o); }}>
      <DialogContent
        className="bg-ls-surface-elevated border-ls-border text-ls-text sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex justify-center pt-2">
          <div className="rounded-full bg-emerald-500/15 p-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-center text-xl">Welcome to Leadora!</DialogTitle>
          <DialogDescription className="text-center text-ls-text-muted">
            Just a few things before you get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="welcome-name">
              Your Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="welcome-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              maxLength={100}
              className="bg-ls-surface border-ls-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome-referral">How did you hear about us?</Label>
            <Select value={referral} onValueChange={setReferral}>
              <SelectTrigger id="welcome-referral" className="bg-ls-surface border-ls-border">
                <SelectValue placeholder="Select an option (optional)" />
              </SelectTrigger>
              <SelectContent>
                {REFERRAL_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="welcome-terms"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="welcome-terms" className="text-sm font-normal leading-snug">
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                Privacy Policy
              </a>
              <span className="text-red-400"> *</span>
            </Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
          >
            {submitting ? "Saving…" : "Get Started"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
