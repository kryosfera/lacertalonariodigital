import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const targetEmail = "enrique.losada@lacer.es";
    const newPassword = "Lacer1234";

    // find user by email via list (admin API lacks getByEmail in v2)
    let userId: string | null = null;
    let page = 1;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw error;
      const found = data.users.find((u) => (u.email ?? "").toLowerCase() === targetEmail);
      if (found) { userId = found.id; break; }
      if (data.users.length < 1000) break;
      page++;
      if (page > 20) break;
    }
    if (!userId) {
      return new Response(JSON.stringify({ error: "user not found" }), {
        status: 404, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ success: true, user_id: userId, email: targetEmail }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
