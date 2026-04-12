import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeShiftCost } from "@/lib/utils/currency";

// POST /api/time-records — clock in or clock out
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shift_id, action, lat, lng } = await request.json();

  // Verify barista is assigned to this shift
  const { data: shift } = await supabase
    .from("shifts")
    .select("filled_by_worker_id, status, title, business_id, start_time, end_time, hourly_rate")
    .eq("id", shift_id)
    .single();

  if (!shift || shift.filled_by_worker_id !== user.id) {
    return NextResponse.json({ error: "Not assigned to this shift" }, { status: 403 });
  }

  if (action === "CLOCK_IN") {
    const { data, error } = await supabase
      .from("time_records")
      .insert({
        shift_id,
        worker_id: user.id,
        clock_in: new Date().toISOString(),
        clock_in_lat: lat,
        clock_in_lng: lng,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Update shift status to IN_PROGRESS
    await supabase
      .from("shifts")
      .update({ status: "IN_PROGRESS" })
      .eq("id", shift_id);

    // Notify business
    await supabase.from("notifications").insert({
      user_id: shift.business_id,
      type: "WORKER_CLOCKED_IN",
      title: "Barista clocked in",
      body: `Your barista has clocked in for "${shift.title}"`,
      data_json: { shift_id },
    });

    return NextResponse.json(data, { status: 201 });
  }

  if (action === "CLOCK_OUT") {
    const { data: record } = await supabase
      .from("time_records")
      .select("id, clock_in")
      .eq("shift_id", shift_id)
      .eq("worker_id", user.id)
      .is("clock_out", null)
      .single();

    if (!record) {
      return NextResponse.json({ error: "No active clock-in found" }, { status: 400 });
    }

    const clockOut = new Date();
    const clockIn = new Date(record.clock_in);
    const totalHours = parseFloat(
      ((clockOut.getTime() - clockIn.getTime()) / 3600000).toFixed(2)
    );

    const { data, error } = await supabase
      .from("time_records")
      .update({ clock_out: clockOut.toISOString(), total_hours: totalHours })
      .eq("id", record.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Notify business to confirm hours
    await supabase.from("notifications").insert({
      user_id: shift.business_id,
      type: "WORKER_CLOCKED_OUT",
      title: "Shift complete — confirm hours",
      body: `Your barista worked ${totalHours} hrs for "${shift.title}". Please confirm to process payment.`,
      data_json: { shift_id, time_record_id: record.id },
    });

    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// PATCH /api/time-records — business confirms hours
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { time_record_id, confirmed_hours } = await request.json();

  const { data: record } = await supabase
    .from("time_records")
    .select("*, shift:shifts(business_id, hourly_rate, filled_by_worker_id, title, status)")
    .eq("id", time_record_id)
    .single();

  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const shift = record.shift as {
    business_id: string;
    hourly_rate: number;
    filled_by_worker_id: string;
    title: string;
    status: string;
  };

  if (shift.business_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const totalHours = confirmed_hours ?? record.total_hours;

  // Confirm time record
  await supabase
    .from("time_records")
    .update({
      confirmed_by_business: true,
      confirmed_at: new Date().toISOString(),
      total_hours: totalHours,
    })
    .eq("id", time_record_id);

  // Mark shift as COMPLETED
  await supabase
    .from("shifts")
    .update({ status: "COMPLETED" })
    .eq("id", record.shift_id);

  // Create transaction
  const cost = computeShiftCost(shift.hourly_rate, totalHours);
  const { data: transaction } = await supabase
    .from("transactions")
    .insert({
      shift_id: record.shift_id,
      business_id: user.id,
      worker_id: shift.filled_by_worker_id,
      total_hours: totalHours,
      hourly_rate: shift.hourly_rate,
      gross_amount: cost.gross,
      platform_fee_pct: 7,
      platform_fee_amount: cost.platformFee,
      worker_payout: cost.gross,
      business_total: cost.businessTotal,
      payment_method: "MANUAL", // default; Stripe flow handled separately
    })
    .select()
    .single();

  // Create invoice
  if (transaction) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    await supabase.from("invoices").insert({
      transaction_id: transaction.id,
      invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      business_id: user.id,
      worker_id: shift.filled_by_worker_id,
      issued_date: new Date().toISOString().split("T")[0],
      due_date: dueDate.toISOString().split("T")[0],
      total_amount: cost.businessTotal,
      status: "SENT",
    });
  }

  // Notify worker of payment incoming
  await supabase.from("notifications").insert({
    user_id: shift.filled_by_worker_id,
    type: "HOURS_CONFIRMED",
    title: "Hours confirmed!",
    body: `Your ${totalHours} hrs for "${shift.title}" have been confirmed. Payment is being processed.`,
    data_json: { shift_id: record.shift_id },
  });

  return NextResponse.json({ success: true });
}
