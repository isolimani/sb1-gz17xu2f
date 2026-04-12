import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// POST /api/admin/reviews — manually add a review
export async function POST(request: NextRequest) {
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

  const { worker_id, shift_id, rating, comment, reviewer_type } =
    await request.json();

  if (!worker_id || !rating) {
    return NextResponse.json(
      { error: "worker_id and rating are required" },
      { status: 400 }
    );
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  const adminSupabase = await createAdminClient();

  // For manual reviews without a shift, we still need a valid shift_id due to FK constraint.
  // If none provided, use a sentinel approach: create a placeholder admin review without FK
  // by using the admin role to bypass the unique constraint on (shift_id, reviewer_id).
  // For now, we require shift_id for linked reviews or handle null separately.

  let reviewData: Record<string, unknown> = {
    reviewer_id: user.id,
    reviewee_id: worker_id,
    reviewer_type: reviewer_type ?? "BUSINESS",
    rating,
    comment: comment || null,
    created_by_admin: true,
  };

  if (shift_id) {
    reviewData = { ...reviewData, shift_id };
  } else {
    // Create a system shift record as a placeholder for externally migrated reviews
    const { data: placeholderShift } = await adminSupabase
      .from("shifts")
      .insert({
        business_id: user.id,
        title: "External review (migrated)",
        address: "N/A",
        suburb: "N/A",
        state: "VIC",
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        hourly_rate: 0,
        status: "COMPLETED",
        filled_by_worker_id: worker_id,
      })
      .select("id")
      .single();

    if (placeholderShift) {
      reviewData = { ...reviewData, shift_id: placeholderShift.id };
    }
  }

  const { data, error } = await adminSupabase
    .from("reviews")
    .insert(reviewData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
