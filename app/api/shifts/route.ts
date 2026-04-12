import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/shifts — list open shifts (barista feed)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const jobType = searchParams.get("jobType") ?? "TEMP";
  const minRate = parseFloat(searchParams.get("minRate") ?? "0");
  const suburb = searchParams.get("suburb") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = 20;

  let query = supabase
    .from("shifts")
    .select(
      `
      *,
      business:business_profiles(business_name, logo_url, suburb, state, avg_rating, type),
      application_count:applications(count)
    `,
      { count: "exact" }
    )
    .eq("status", "OPEN")
    .eq("job_type", jobType)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (minRate > 0) query = query.gte("hourly_rate", minRate);
  if (suburb) query = query.ilike("suburb", `%${suburb}%`);

  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    count,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}

// POST /api/shifts — create a shift (business)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("shifts")
    .insert({ ...body, business_id: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Insert welcome notification
  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "SHIFT_PUBLISHED",
    title: "Shift published",
    body: `Your shift "${body.title}" is now live.`,
    data_json: { shift_id: data.id },
  });

  return NextResponse.json(data, { status: 201 });
}
