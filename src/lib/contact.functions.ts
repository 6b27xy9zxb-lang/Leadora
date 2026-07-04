import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ContactInput = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(2000),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ContactInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });
    if (error) {
      console.error("[submitContactMessage]", error);
      throw new Error("Failed to send message. Please try again.");
    }
    return { ok: true };
  });

export const listContactMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      console.error("[listContactMessages]", error);
      throw new Error("Failed to load messages.");
    }
    return data ?? [];
  });

export const markContactRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), is_read: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("contact_messages")
      .update({ is_read: data.is_read })
      .eq("id", data.id);
    if (error) {
      console.error("[markContactRead]", error);
      throw new Error("Failed to update message.");
    }
    return { ok: true };
  });
