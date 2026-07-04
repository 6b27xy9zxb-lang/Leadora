import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { getProfile } from "@/lib/profile.functions";
import { updatePaymentMethod, removePaymentMethod, listInvoices, getInvoice, cancelSubscription } from "@/lib/billing.functions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, CreditCard, Trash2, Eye, Download, FileText, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/billing")({
  head: () => ({ meta: [{ title: "Billing — Leadora" }] }),
  component: BillingPage,
});

const PLANS = [
  { name: "Free", price: 0, searches: 20, scripts: 5, features: ["Basic CRM", "5 AI scripts/mo"] },
  { name: "Pro", price: 25, searches: 200, scripts: 50, features: ["Hosting", "Analytics", "Priority queue"], featured: true },
  { name: "Max", price: 50, searches: 500, scripts: 100, features: ["Everything in Pro", "Priority support", "Beta features"] },
];

function BillingPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const getProfileFn = useServerFn(getProfile);
  const updatePaymentMethodFn = useServerFn(updatePaymentMethod);
  const removePaymentMethodFn = useServerFn(removePaymentMethod);
  const listInvoicesFn = useServerFn(listInvoices);
  const getInvoiceFn = useServerFn(getInvoice);
  const cancelSubscriptionFn = useServerFn(cancelSubscription);
  const { data } = useQuery({ queryKey: ["profile"], queryFn: () => getProfileFn() });
  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: () => listInvoicesFn(),
  });

  const [paymentMethod, setPaymentMethod] = useState<{ last4: string; brand: string } | null>(null);
  const [pendingInvoice, setPendingInvoice] = useState<{ id: string; action: "view" | "download" } | null>(null);

  const fetchInvoice = async (id: string, action: "view" | "download") => {
    setPendingInvoice({ id, action });
    const toastId = `invoice-${id}-${action}`;
    toast.loading(action === "view" ? "Opening invoice…" : "Preparing download…", { id: toastId });
    try {
      const invoice = await getInvoiceFn({ data: { id } });
      if (action === "view") {
        window.open(invoice.url, "_blank", "noopener,noreferrer");
        toast.success("Invoice opened", {
          id: toastId,
          description: `${invoice.number} • $${invoice.amount.toFixed(2)} • ${invoice.status}`,
        });
      } else {
        const a = document.createElement("a");
        a.href = invoice.url;
        a.download = `${invoice.number}.pdf`;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success("Invoice downloaded", {
          id: toastId,
          description: `${invoice.number}.pdf saved to your device.`,
        });
      }
    } catch (error) {
      toast.error(action === "view" ? "Couldn't open invoice" : "Couldn't download invoice", {
        id: toastId,
        description: error instanceof Error ? error.message : "Invoice retrieval failed. Please try again or contact support.",
      });
    } finally {
      setPendingInvoice(null);
    }
  };

  const startCheckout = (planName: string) => {
    const target = planName.toLowerCase();
    if (target !== "pro" && target !== "max") return;
    toast.info("Redirecting to checkout…", { description: `Setting up ${planName} plan payment.` });
    navigate({ to: "/checkout/$plan", params: { plan: target } });
  };

  const cancel = useMutation({
    mutationFn: () => cancelSubscriptionFn(),
    onMutate: () => {
      toast.loading("Cancelling subscription…", { id: "cancel-subscription" });
    },
    onSuccess: () => {
      toast.success("Subscription cancelled", {
        id: "cancel-subscription",
        description: "You've been moved to the Free plan. Access continues until the end of the current billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      toast.error("Cancellation failed", {
        id: "cancel-subscription",
        description: error instanceof Error ? error.message : "We couldn't cancel your subscription. Please try again or contact support.",
      });
    },
  });

  const updatePayment = useMutation({
    mutationFn: () => updatePaymentMethodFn({ data: { last4: "4242", brand: "visa" } }),
    onSuccess: (result) => {
      setPaymentMethod(result);
      toast.success("Payment method updated", {
        description: `Your card ending in ${result.last4} is now set as the default payment method.`,
      });
    },
    onError: (error) => {
      toast.error("Payment method update failed", {
        description: error instanceof Error ? error.message : "We couldn't update your payment method. Please try again or contact support.",
      });
    },
  });

  const removePayment = useMutation({
    mutationFn: () => removePaymentMethodFn(),
    onSuccess: () => {
      setPaymentMethod(null);
      toast.success("Payment method removed", {
        description: "Your card has been removed from billing.",
      });
    },
    onError: (error) => {
      toast.error("Payment method removal failed", {
        description: error instanceof Error ? error.message : "We couldn't remove your payment method. Please try again or contact support.",
      });
    },
  });

  const plan = data?.plan ?? "free";
  const max = PLANS.find((p) => p.name.toLowerCase() === plan) ?? PLANS[0];

  return (
    <div className="p-6 md:p-10 max-w-6xl">
      <h1 className="text-3xl font-semibold text-ls-text">Billing & plans</h1>

      <Card className="mt-6 p-6 bg-card border-ls-border">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-ls-text-muted">Current plan</div>
            <div className="text-2xl font-semibold text-ls-text mt-1 capitalize">{plan}</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Active</Badge>
            {plan !== "free" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={cancel.isPending}>
                    {cancel.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4 mr-1.5" /> Cancel</>}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You'll be moved to the Free plan. Search and script credits will reset accordingly. You can re-subscribe at any time.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep plan</AlertDialogCancel>
                    <AlertDialogAction onClick={() => cancel.mutate()}>Cancel subscription</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-ls-text/70">Search credits</span><span className="text-ls-text">{data?.search_credits ?? 0} / {max.searches}</span></div>
            <Progress value={Math.min(100, ((data?.search_credits ?? 0) / max.searches) * 100)} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span className="text-ls-text/70">AI scripts</span><span className="text-ls-text">{data?.script_credits ?? 0} / {max.scripts}</span></div>
            <Progress value={Math.min(100, ((data?.script_credits ?? 0) / max.scripts) * 100)} />
          </div>
        </div>
      </Card>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const isCurrent = plan === p.name.toLowerCase();
          return (
            <Card key={p.name} className={`p-6 border ${p.featured ? "border-primary/50 bg-primary/5" : "border-ls-border bg-card"}`}>
              <div className="text-ls-text-muted uppercase tracking-widest text-xs">{p.name}</div>
              <div className="mt-2 text-4xl font-semibold text-ls-text">${p.price}<span className="text-sm font-light border-ls-border/500">/mo</span></div>
              <ul className="mt-4 space-y-2 text-sm text-ls-text/80">
                <li className="flex gap-2"><Check className="h-4 w-4 text-success" /> {p.searches} search credits</li>
                <li className="flex gap-2"><Check className="h-4 w-4 text-success" /> {p.scripts} AI scripts</li>
                {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-success" /> {f}</li>)}
              </ul>
              <Button
                className="w-full mt-6"
                disabled={isCurrent || p.name === "Free"}
                variant={p.featured ? "default" : "outline"}
                onClick={() => startCheckout(p.name)}
              >
                {isCurrent ? "Current" : p.name === "Free" ? "Free" : "Upgrade"}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 p-6 bg-card border-ls-border">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ls-surface-elevated">
              <CreditCard className="h-5 w-5 text-ls-text/80" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-ls-text-muted">Payment method</div>
              <div className="text-sm font-medium text-ls-text mt-1">
                {paymentMethod ? `${paymentMethod.brand} ending in ${paymentMethod.last4}` : "No card on file"}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={updatePayment.isPending || removePayment.isPending}
              onClick={() => updatePayment.mutate()}
            >
              {updatePayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!paymentMethod || removePayment.isPending || updatePayment.isPending}
              onClick={() => removePayment.mutate()}
            >
              {removePayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mt-6 p-6 bg-card border-ls-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ls-surface-elevated">
            <FileText className="h-5 w-5 text-ls-text/80" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-ls-text-muted">Invoice history</div>
            <div className="text-sm font-medium text-ls-text mt-1">Past billing receipts</div>
          </div>
        </div>
        <div className="mt-5 divide-y divide-white/5">
          {invoicesQuery.isLoading && (
            <div className="py-6 text-sm text-ls-text-muted flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading invoices…
            </div>
          )}
          {invoicesQuery.data?.length === 0 && (
            <div className="py-6 text-sm text-ls-text-muted">No invoices yet.</div>
          )}
          {invoicesQuery.data?.map((inv) => {
            const isPending = pendingInvoice?.id === inv.id;
            return (
              <div key={inv.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-sm text-ls-text font-medium">{inv.number}</div>
                  <div className="text-xs border-ls-border/500">
                    {new Date(inv.date).toLocaleDateString()} • {inv.plan} • ${inv.amount.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{inv.status}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => fetchInvoice(inv.id, "view")}
                  >
                    {isPending && pendingInvoice?.action === "view" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => fetchInvoice(inv.id, "download")}
                  >
                    {isPending && pendingInvoice?.action === "download" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <p className="mt-6 text-xs text-ls-text/40">
        Billing is simulated for now — no real charges are processed.
      </p>
    </div>
  );
}
