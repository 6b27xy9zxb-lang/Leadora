import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PLANS = {
  free: { search_credits: 20, script_credits: 5 },
  pro: { search_credits: 200, script_credits: 50 },
  max: { search_credits: 500, script_credits: 100 },
};

const planSchema = z.object({
  plan: z.enum(["free", "pro", "max"]),
});

export const upgradePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => planSchema.parse(data))
  .handler(async ({ data }) => {
    // SECURITY: Plan upgrades must be gated by a verified payment.
    // No payment provider is integrated yet, so this endpoint is intentionally
    // disabled to prevent any authenticated user from granting themselves
    // paid-tier credits (Pro/Max) without paying.
    //
    // To re-enable: integrate Stripe (or another provider), verify the
    // checkout session / webhook signature, and only then update the
    // profile's plan + credits — ideally from a webhook handler under
    // /api/public/webhooks/* rather than this user-callable endpoint.
    console.warn("[upgradePlan] blocked — no payment provider configured", {
      requestedPlan: data.plan,
    });
    throw new Error(
      "Plan upgrades are temporarily unavailable. Please contact support to change your plan.",
    );
  });

// MOCK CHECKOUT — simulates a successful payment for demo purposes only.
// No real money is collected. Updates the profile's plan + credits directly.
export const mockCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      plan: z.enum(["pro", "max"]),
      method: z.enum(["upi", "card", "netbanking", "wallet"]),
      reference: z.string().min(4).max(64),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const credits = PLANS[data.plan];
    const { error } = await context.supabase
      .from("profiles")
      .update({
        plan: data.plan,
        search_credits: credits.search_credits,
        script_credits: credits.script_credits,
      })
      .eq("id", context.userId);
    if (error) throw new Error("Could not update plan. Please try again.");
    return {
      ok: true,
      plan: data.plan,
      method: data.method,
      reference: data.reference,
      amount: data.plan === "pro" ? 25 : 50,
      ...credits,
    };
  });


const paymentMethodSchema = z.object({
  last4: z.string().length(4),
  brand: z.enum(["visa", "mastercard", "amex", "discover"]),
});

export const updatePaymentMethod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => paymentMethodSchema.parse(data))
  .handler(async ({ data }) => {
    // Simulated: real payment provider integration would tokenize the card here.
    return { last4: data.last4, brand: data.brand };
  });

export const removePaymentMethod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    // Simulated: real payment provider integration would detach the payment method here.
    return { ok: true };
  });

export const cancelSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        plan: "free",
        search_credits: PLANS.free.search_credits,
        script_credits: PLANS.free.script_credits,
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { plan: "free", ...PLANS.free };
  });

const INVOICES = [
  { id: "inv_2026_06", number: "INV-2026-0006", date: "2026-06-01", amount: 25, status: "paid", plan: "Pro" },
  { id: "inv_2026_05", number: "INV-2026-0005", date: "2026-05-01", amount: 25, status: "paid", plan: "Pro" },
  { id: "inv_2026_04", number: "INV-2026-0004", date: "2026-04-01", amount: 25, status: "paid", plan: "Pro" },
];

export const listInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => INVOICES);

const invoiceIdSchema = z.object({ id: z.string().min(1) });

export const getInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => invoiceIdSchema.parse(data))
  .handler(async ({ data }) => {
    const invoice = INVOICES.find((i) => i.id === data.id);
    if (!invoice) throw new Error("Invoice not found");
    return { ...invoice, url: `https://invoices.leadora.app/${invoice.id}.pdf` };
  });
