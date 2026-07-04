import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("[listProjects]", error);
      throw new Error("Failed to load projects.");
    }
    return data ?? [];
  });

const CreateInput = z.object({
  business_name: z.string().min(1),
  category: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  lead_id: z.string().uuid().optional(),
});

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("projects").insert({ ...data, user_id: context.userId, status: "new" })
      .select().single();
    if (error) {
      console.error("[createProject]", error);
      throw new Error("Failed to create project.");
    }
    return row;
  });

const StatusInput = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "preview_sent", "closed"]),
});

export const updateProjectStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StatusInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("projects").update({ status: data.status }).eq("id", data.id);
    if (error) {
      console.error("[updateProjectStatus]", error);
      throw new Error("Failed to update project status.");
    }
    return { ok: true };
  });

export const getProjectViews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("preview_views").select("*").eq("project_id", data.id)
      .order("viewed_at", { ascending: false });
    if (error) {
      console.error("[getProjectViews]", error);
      throw new Error("Failed to load analytics.");
    }
    return rows ?? [];
  });
