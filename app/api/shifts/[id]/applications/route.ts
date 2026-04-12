import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/shifts/[id]/applications
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      worker:worker_profiles(
        *,
        user:users(name, avatar_url, email)
      )
    `)
    .eq("shift_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

// POST /api/shifts/[id]/applications — barista applies
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await request.json();

  // Check shift is still open
  const { data: shift } = await supabase
    .from("shifts")
    .select("status, title, business_id")
    .eq("id", id)
    .single();

  if (!shift || shift.status !== "OPEN") {
    return NextResponse.json(
      { error: "This shift is no longer accepting applications" },
      { status: 400 }
    );
  }

  // Insert application
  const { data: application, error } = await supabase
    .from("applications")
    .insert({ shift_id: id, worker_id: user.id, message })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.code === "23505" ? 409 : 400 } // 409 = already applied
    );
  }

  // Notify business
  await supabase.from("notifications").insert({
    user_id: shift.business_id,
    type: "NEW_APPLICATION",
    title: "New application",
    body: `Someone applied for "${shift.title}"`,
    data_json: { shift_id: id, application_id: application.id },
  });

  return NextResponse.json(application, { status: 201 });
}
