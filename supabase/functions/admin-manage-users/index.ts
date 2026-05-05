import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "No autorizado" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "Sesión inválida" }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return json({ error: "Solo administradores" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "list_emails") {
      const emails: { user_id: string; email: string | null; last_sign_in_at: string | null }[] = [];
      let page = 1;
      const perPage = 1000;
      // Paginate
      while (true) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
        if (error) throw error;
        for (const u of data.users) {
          emails.push({
            user_id: u.id,
            email: u.email ?? null,
            last_sign_in_at: u.last_sign_in_at ?? null,
          });
        }
        if (data.users.length < perPage) break;
        page++;
        if (page > 20) break; // safety
      }
      return json({ users: emails });
    }

    if (action === "delete_user") {
      const targetUserId = body?.target_user_id;
      const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 500) : null;
      if (!targetUserId || typeof targetUserId !== "string") {
        return json({ error: "target_user_id requerido" }, 400);
      }
      if (targetUserId === userData.user.id) {
        return json({ error: "No puedes eliminarte a ti mismo" }, 400);
      }

      // Block deleting another admin
      const { data: targetRole } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", targetUserId)
        .eq("role", "admin")
        .maybeSingle();
      if (targetRole) {
        return json({ error: "No se puede eliminar a otro administrador. Quita primero su rol." }, 400);
      }

      // Capture identifying info BEFORE deletion (for audit log)
      const { data: targetProfile } = await admin
        .from("profiles")
        .select("clinic_name, professional_name")
        .eq("user_id", targetUserId)
        .maybeSingle();

      let targetEmail: string | null = null;
      try {
        const { data: tu } = await admin.auth.admin.getUserById(targetUserId);
        targetEmail = tu?.user?.email ?? null;
      } catch (_e) { /* ignore */ }

      const targetLabel =
        targetProfile?.clinic_name ||
        targetProfile?.professional_name ||
        targetEmail ||
        targetUserId;

      // Delete app data first (no FKs to auth.users)
      await admin.from("user_roles").delete().eq("user_id", targetUserId);
      await admin.from("ticket_messages").delete().eq("user_id", targetUserId);
      await admin.from("tickets").delete().eq("user_id", targetUserId);
      await admin.from("recipe_templates").delete().eq("user_id", targetUserId);
      await admin.from("recipes").delete().eq("user_id", targetUserId);
      await admin.from("patients").delete().eq("user_id", targetUserId);
      await admin.from("profiles").delete().eq("user_id", targetUserId);

      const { error: delErr } = await admin.auth.admin.deleteUser(targetUserId);
      if (delErr) throw delErr;

      // Record audit entry (best-effort, do not fail the request if logging fails)
      const { error: auditErr } = await admin.from("user_deletion_audit").insert({
        deleted_user_id: targetUserId,
        deleted_user_email: targetEmail,
        deleted_user_label: targetLabel,
        deleted_by: userData.user.id,
        deleted_by_email: userData.user.email ?? null,
        reason,
      });
      if (auditErr) console.error("audit insert failed", auditErr);

      return json({ success: true });
    }

    if (action === "list_deletion_audit") {
      const { data, error } = await admin
        .from("user_deletion_audit")
        .select("*")
        .order("deleted_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return json({ entries: data ?? [] });
    }

    return json({ error: "Acción no soportada" }, 400);
  } catch (e) {
    console.error("admin-manage-users error", e);
    return json({ error: (e as Error).message ?? "Error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
