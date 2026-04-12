import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/applications/[id] — business offers/rejects, barista accepts/declines
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

  const { status, shiftId } = await request.json();

  // Verify the caller has permission to change this application
  const { data: app } = await supabase
    .from("applications")
    .select("*, shift:shifts(business_id, title, status, filled_by_worker_id)")
    .eq("id", id)
    .single();

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const shift = app.shift as {
    business_id: string;
    title: string;
    status: string;
    filled_by_worker_id: string | null;
  };

  const isBusinessAction = shift.business_id === user.id;
  const isWorkerAction = app.worker_id === user.id;

  if (!isBusinessAction && !isWorkerAction) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate transitions
  const businessAllowed = ["OFFERED", "REJECTED"];
  const workerAllowed = ["ACCEPTED", "DECLINED", "WITHDRAWN"];

  if (isBusinessAction && !businessAllowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
  }
  if (isWorkerAction && !workerAllowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
  }

  // Update application
  const { error: updateError } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // If worker ACCEPTED → fill the shift, reject all other applications
  if (status === "ACCEPTED") {
    await supabase
      .from("shifts")
      .update({ status: "FILLED", filled_by_worker_id: app.worker_id })
      .eq("id", app.shift_id);

    // Reject all other pending applications
    await supabase
      .from("applications")
      .update({ status: "REJECTED" })
      .eq("shift_id", app.shift_id)
      .neq("id", id)
      .in("status", ["PENDING", "OFFERED"]);

    // Notify worker
    await supabase.from("notifications").insert({
      user_id: app.worker_id,
      type: "SHIFT_ACCEPTED",
      title: "You got the shift!",
      body: `You've been booked for "${shift.title}".`,
      data_json: { shift_id: app.shift_id, application_id: id },
    });
  }

  // If business OFFEREDs → notify worker
  if (status === "OFFERED") {
    await supabase.from("notifications").insert({
      user_id: app.worker_id,
      type: "SHIFT_OFFERED",
      title: "Job offer!",
      body: `You've been offered the "${shift.title}" shift. Accept or decline ASAP.`,
      data_json: { shift_id: app.shift_id, application_id: id },
    });

    // Insert system message into chat
    await supabase.from("shift_messages").insert({
      shift_id: app.shift_id,
      application_id: id,
      sender_type: "SYSTEM",
      content: `The business has offered you this shift. Please accept or decline as soon as possible.`,
    });
  }

  // If REJECTED/DECLINED → notify the other party
  if (status === "REJECTED") {
    await supabase.from("notifications").insert({
      user_id: app.worker_id,
      type: "APPLICATION_REJECTED",
      title: "Application not selected",
      body: `Your application for "${shift.title}" was not selected this time.`,
      data_json: { shift_id: app.shift_id },
    });
  }

  if (status === "DECLINED") {
    await supabase.from("notifications").insert({
      user_id: shift.business_id,
      type: "OFFER_DECLINED",
      title: "Offer declined",
      body: `A barista declined your offer for "${shift.title}".`,
      data_json: { shift_id: app.shift_id },
    });

    // Re-open shift if it was set to FILLED from a previous offer
    if (shift.status === "FILLED") {
      await supabase
        .from("shifts")
        .update({ status: "OPEN", filled_by_worker_id: null })
        .eq("id", app.shift_id);
    }
  }

  return NextResponse.json({ success: true });
}
