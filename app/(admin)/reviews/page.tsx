import { createClient } from "@/lib/supabase/server";
import ManualReviewForm from "./ManualReviewForm";
import { StarRating } from "@/components/ui/Avatar";
import { formatShortDate } from "@/lib/utils/date";

export const metadata = { title: "Manual reviews" };

export default async function AdminReviewsPage() {
  const supabase = await createClient();

  // Get recent manually-created reviews
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:users!reviewer_id(name),
      reviewee:users!reviewee_id(name)
    `)
    .eq("created_by_admin", true)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get all workers for the form
  const { data: workers } = await supabase
    .from("worker_profiles")
    .select("user_id, user:users(name, email)")
    .eq("vetting_status", "APPROVED")
    .order("created_at", { ascending: false });

  // Get all completed shifts (need a shift_id for review)
  const { data: completedShifts } = await supabase
    .from("shifts")
    .select("id, title, start_time, business:business_profiles(business_name), filled_by_worker_id")
    .eq("status", "COMPLETED")
    .order("start_time", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-foreground">Manual reviews</h1>
        <p className="text-sm text-muted mt-1">
          Add reviews for baristas migrating from other platforms, or for
          shifts completed outside the app.
        </p>
      </div>

      {/* Add review form */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">Add review</h2>
        <ManualReviewForm
          workers={
            (workers ?? []).map((w) => ({
              user_id: w.user_id,
              name: (w.user as { name: string; email: string } | null)?.name ?? "Unknown",
              email:
                (w.user as { name: string; email: string } | null)?.email ?? "",
            }))
          }
          shifts={
            (completedShifts ?? []).map((s) => ({
              id: s.id,
              title: s.title,
              start_time: s.start_time,
              business_name:
                (s.business as { business_name: string } | null)
                  ?.business_name ?? "Unknown",
              worker_id: s.filled_by_worker_id,
            }))
          }
        />
      </div>

      {/* Recent manual reviews */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">
          Recent manual reviews ({recentReviews?.length ?? 0})
        </h2>

        {(!recentReviews || recentReviews.length === 0) && (
          <p className="text-muted text-sm text-center py-4">
            No manual reviews yet.
          </p>
        )}

        <div className="space-y-3">
          {recentReviews?.map((review) => (
            <div
              key={review.id}
              className="flex items-start gap-3 py-3 border-b border-border last:border-0"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground">
                    {(review.reviewee as { name: string } | null)?.name}
                  </p>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="text-xs text-muted italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}
                <p className="text-xs text-muted mt-1">
                  Added by admin ·{" "}
                  {formatShortDate(review.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
