import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles").select("*").eq("id", context.userId).maybeSingle();
    if (error) {
      console.error("[getProfile]", error);
      throw new Error("Failed to load profile.");
    }
    return data;

  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ username: z.string().min(1).max(60) }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("profiles").update({ username: data.username }).eq("id", context.userId);
    if (error) {
      console.error("[updateProfile]", error);
      throw new Error("Failed to update profile.");
    }

    return { ok: true };
  });

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Cascade: delete user-owned rows then auth user.
    await supabaseAdmin.from("leads").delete().eq("user_id", userId);
    await supabaseAdmin.from("scripts").delete().eq("user_id", userId);
    await supabaseAdmin.from("projects").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("[deleteAccount]", error);
      throw new Error("Failed to delete account.");
    }

    return { ok: true };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profile, leads, scripts, projects] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("scripts").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("projects").select("id, status").eq("user_id", userId),
    ]);
    const recent = await supabase.from("leads").select("*").eq("user_id", userId)
      .order("saved_at", { ascending: false }).limit(5);
    return {
      profile: profile.data,
      leadCount: leads.count ?? 0,
      scriptCount: scripts.count ?? 0,
      projectCount: (projects.data ?? []).filter((p) => p.status !== "closed").length,
      recentLeads: recent.data ?? [],
    };
  });
