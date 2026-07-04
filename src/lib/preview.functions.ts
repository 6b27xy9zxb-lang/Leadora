import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Preview endpoints are public (no auth) but trust the server to enforce
// token-gating. We use the service-role client because anon RLS policies
// have been removed from `projects` and `preview_views` for safety.
async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const getPreview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token: z.string().min(4) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await adminClient();
    const { data: project, error } = await sb
      .from("projects")
      .select("id, business_name, category, city, phone")
      .eq("preview_token", data.token)
      .maybeSingle();
    if (error) {
      console.error("[getPreview]", error);
      throw new Error("Preview unavailable.");
    }
    if (!project) return null;

    const { error: insertErr } = await sb
      .from("preview_views")
      .insert({ project_id: project.id });
    if (insertErr) console.error("[getPreview] view insert failed", insertErr);
    return project;
  });

export const trackCtaClick = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ token: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = await adminClient();
    const { data: project } = await sb
      .from("projects")
      .select("id")
      .eq("preview_token", data.token)
      .maybeSingle();
    if (!project) return { ok: false };
    const { error } = await sb
      .from("preview_views")
      .insert({ project_id: project.id, is_cta_clicked: true });
    if (error) console.error("[trackCtaClick]", error);
    return { ok: true };
  });
