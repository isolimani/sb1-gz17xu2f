import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Return invoices for the authenticated user (worker or business)
  const { data: userRow } = await supabase
    .from("users")
    .select("has_worker_profile, has_business_profile, active_role")
    .eq("id", user.id)
    .single();

  let query = supabase
    .from("invoices")
    .select(`
      *,
      transaction:transactions(total_hours, hourly_rate, gross_amount, platform_fee_amount, business_total, payment_method, status),
      worker:users!worker_id(name, email),
      business:business_profiles(business_name, logo_url)
    `)
    .order("created_at", { ascending: false });

  if (userRow?.active_role === "BUSINESS" && userRow.has_business_profile) {
    query = query.eq("business_id", user.id);
  } else {
    query = query.eq("worker_id", user.id);
  }

  const { data: invoices, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(invoices);
}
