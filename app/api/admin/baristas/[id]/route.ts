import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// PATCH /api/admin/baristas/[id] — approve or reject barista
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check admin
  const { data: userRow } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!userRow?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { vetting_status } = await request.json();

  if (!["APPROVED", "REJECTED"].includes(vetting_status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const adminSupabase = await createAdminClient();

  const { error } = await adminSupabase
    .from("worker_profiles")
    .update({ vetting_status })
    .eq("user_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the worker
  await adminSupabase.from("notifications").insert({
    user_id: id,
    type: vetting_status === "APPROVED" ? "VETTING_APPROVED" : "VETTING_REJECTED",
    title:
      vetting_status === "APPROVED"
        ? "Profile approved!"
        : "Profile not approved",
    body:
      vetting_status === "APPROVED"
        ? "Your Cuppa profile is approved. Start browsing shifts now!"
        : "Your profile wasn't approved. Contact support if you have questions.",
  });

  return NextResponse.json({ success: true });
}
