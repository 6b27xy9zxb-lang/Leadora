import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { mockCheckout } from "@/lib/billing.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, ShieldCheck, Smartphone, CreditCard, Building2, Wallet, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/checkout/$plan")({
  head: () => ({ meta: [{ title: "Checkout — Leadora" }] }),
  component: CheckoutPage,
});

const PLANS = {
  pro: { name: "Pro", price: 25, searches: 200, scripts: 50 },
  max: { name: "Max", price: 50, searches: 500, scripts: 100 },
} as const;

type PlanKey = keyof typeof PLANS;

function CheckoutPage() {
  const { plan } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const planKey = (plan === "pro" || plan === "max" ? plan : "pro") as PlanKey;
  const p = PLANS[planKey];

  const checkoutFn = useServerFn(mockCheckout);
  const [method, setMethod] = useState<"upi" | "card" | "netbanking" | "wallet">("upi");
  const [upi, setUpi] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [bank, setBank] = useState("HDFC");
  const [wallet, setWallet] = useState("Paytm");

  const pay = useMutation({
    mutationFn: () => {
      const reference =
        method === "upi" ? upi :
        method === "card" ? `card-${cardNum.slice(-4)}` :
        method === "netbanking" ? `nb-${bank}` :
        `wallet-${wallet}`;
      return checkoutFn({ data: { plan: planKey, method, reference } });
    },
    onMutate: () => {
      toast.loading("Processing payment…", { id: "mock-pay", description: `Charging ₹${(p.price * 83).toFixed(0)} via ${method.toUpperCase()}` });
    },
    onSuccess: (r) => {
      toast.success("Payment successful 🎉", {
        id: "mock-pay",
        description: `Welcome to ${PLANS[planKey].name}! Ref: ${r.reference}`,
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate({ to: "/billing" });
    },
    onError: (e) => {
      toast.error("Payment failed", {
        id: "mock-pay",
        description: e instanceof Error ? e.message : "Please try again.",
      });
    },
  });

  const canPay =
    (method === "upi" && /^[\w.\-]{2,}@[\w]{2,}$/.test(upi)) ||
    (method === "card" && cardNum.replace(/\s/g, "").length >= 12 && cardExp.length >= 4 && cardCvv.length >= 3) ||
    (method === "netbanking" && !!bank) ||
    (method === "wallet" && !!wallet);

  const inr = (p.price * 83).toFixed(0);

  return (
    <div className="p-6 md:p-10 max-w-5xl">
      <Link to="/billing" className="inline-flex items-center gap-2 text-sm text-ls-text-muted hover:text-ls-text">
        <ArrowLeft className="h-4 w-4" /> Back to billing
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <h1 className="text-3xl font-semibold text-ls-text">Checkout</h1>
        <Badge variant="secondary">Demo mode — no real charge</Badge>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_360px]">
        <Card className="p-6 bg-card border-ls-border">
          <div className="text-xs uppercase tracking-widest text-ls-text-muted">Payment method</div>

          <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)} className="mt-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="upi"><Smartphone className="h-4 w-4 mr-1.5" />UPI</TabsTrigger>
              <TabsTrigger value="card"><CreditCard className="h-4 w-4 mr-1.5" />Card</TabsTrigger>
              <TabsTrigger value="netbanking"><Building2 className="h-4 w-4 mr-1.5" />Net Banking</TabsTrigger>
              <TabsTrigger value="wallet"><Wallet className="h-4 w-4 mr-1.5" />Wallet</TabsTrigger>
            </TabsList>

            <TabsContent value="upi" className="mt-6 space-y-3">
              <Label>UPI ID</Label>
              <Input placeholder="yourname@okhdfcbank" value={upi} onChange={(e) => setUpi(e.target.value)} />
              <p className="text-xs border-ls-border/500">Supports GPay, PhonePe, Paytm, BHIM and any UPI app.</p>
            </TabsContent>

            <TabsContent value="card" className="mt-6 space-y-3">
              <Label>Card number</Label>
              <Input placeholder="4242 4242 4242 4242" value={cardNum} onChange={(e) => setCardNum(e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Expiry</Label>
                  <Input placeholder="MM/YY" value={cardExp} onChange={(e) => setCardExp(e.target.value)} />
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input placeholder="123" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} />
                </div>
              </div>
              <p className="text-xs border-ls-border/500">Visa, Mastercard, RuPay, Amex accepted.</p>
            </TabsContent>

            <TabsContent value="netbanking" className="mt-6 space-y-3">
              <Label>Select bank</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Yes Bank"].map((b) => (
                  <Button key={b} type="button" variant={bank === b ? "default" : "outline"} onClick={() => setBank(b)}>
                    {b}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wallet" className="mt-6 space-y-3">
              <Label>Select wallet</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Paytm", "PhonePe", "Amazon Pay", "Mobikwik", "Freecharge"].map((w) => (
                  <Button key={w} type="button" variant={wallet === w ? "default" : "outline"} onClick={() => setWallet(w)}>
                    {w}
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex items-center gap-2 text-xs border-ls-border/500">
            <ShieldCheck className="h-4 w-4 text-success" />
            This is a simulated checkout for demo purposes. No real money is debited.
          </div>
        </Card>

        <Card className="p-6 bg-card border-ls-border h-fit">
          <div className="text-xs uppercase tracking-widest text-ls-text-muted">Order summary</div>
          <div className="mt-3 text-2xl font-semibold text-ls-text">{p.name} plan</div>
          <ul className="mt-4 space-y-2 text-sm text-ls-text/80">
            <li className="flex gap-2"><Check className="h-4 w-4 text-success" /> {p.searches} search credits</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-success" /> {p.scripts} AI scripts</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-success" /> Monthly billing</li>
          </ul>
          <div className="mt-5 border-t border-ls-border pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-ls-text/70"><span>Subtotal</span><span>₹{inr}</span></div>
            <div className="flex justify-between text-ls-text/70"><span>GST (18%)</span><span>₹{(Number(inr) * 0.18).toFixed(0)}</span></div>
            <div className="flex justify-between text-ls-text font-semibold pt-2"><span>Total</span><span>₹{(Number(inr) * 1.18).toFixed(0)}</span></div>
          </div>
          <Button className="w-full mt-5" disabled={!canPay || pay.isPending} onClick={() => pay.mutate()}>
            {pay.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing…</> : `Pay ₹${(Number(inr) * 1.18).toFixed(0)}`}
          </Button>
          <p className="mt-3 text-[10px] text-ls-text/40 text-center">By paying, you agree to the demo terms. Cancel anytime from Billing.</p>
        </Card>
      </div>
    </div>
  );
}
