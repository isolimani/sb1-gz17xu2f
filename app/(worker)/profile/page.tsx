import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatShortDate } from "@/lib/utils/date";

export const metadata = { title: "Profile" };

const REVIEW_TABS = ["Worked at", "Recent"] as const;

export default async function WorkerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "Recent" ? "Recent" : "Worked at";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: userRow } = await supabase
    .from("users")
    .select("name, email, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: worker } = await supabase
    .from("worker_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Reviews received by this worker (from businesses)
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      shift:shifts(
        title,
        start_time,
        business:business_profiles(business_name, logo_url)
      )
    `)
    .eq("reviewee_id", user.id)
    .eq("reviewer_type", "BUSINESS")
    .order("created_at", { ascending: false });

  // Group by business for "Worked at" tab
  const businessGroups: Record<
    string,
    {
      businessName: string;
      logoUrl?: string;
      reviews: typeof reviews;
    }
  > = {};

  if (reviews) {
    for (const review of reviews) {
      const shift = review.shift as {
        title: string;
        start_time: string;
        business: { business_name: string; logo_url?: string } | null;
      } | null;
      const bizName = shift?.business?.business_name ?? "Unknown business";
      if (!businessGroups[bizName]) {
        businessGroups[bizName] = {
          businessName: bizName,
          logoUrl: shift?.business?.logo_url,
          reviews: [],
        };
      }
      businessGroups[bizName].reviews!.push(review);
    }
  }

  const vettingColors: Record<string, string> = {
    PENDING: "bg-warning/10 text-warning border-warning/30",
    APPROVED: "bg-success/10 text-success border-success/30",
    REJECTED: "bg-error/10 text-error border-error/30",
  };
  const vettingLabels: Record<string, string> = {
    PENDING: "Under review",
    APPROVED: "Verified",
    REJECTED: "Not approved",
  };

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-2xl bg-brand/10 border border-border flex items-center justify-center shrink-0 overflow-hidden">
            {userRow?.avatar_url ? (
              <Image
                src={userRow.avatar_url}
                alt={userRow?.name ?? ""}
                width={64}
                height={64}
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-brand">
                {userRow?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-black text-foreground">
                  {userRow?.name}
                </h1>
                <p className="text-sm text-muted">{userRow?.email}</p>
              </div>
              <Link href="/worker/profile/edit">
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>

            {/* Vetting badge */}
            {worker?.vetting_status && (
              <span
                className={`mt-2 inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border ${
                  vettingColors[worker.vetting_status]
                }`}
              >
                {worker.vetting_status === "APPROVED" ? "✓ " : ""}
                {vettingLabels[worker.vetting_status]}
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-border">
          {[
            {
              label: "Rating",
              value: worker?.avg_rating != null
                ? `${worker.avg_rating.toFixed(1)} ★`
                : "New",
            },
            { label: "Shifts", value: worker?.total_shifts_completed ?? 0 },
            { label: "Completion", value: `${worker?.completion_rate ?? 100}%` },
            { label: "Karma", value: worker?.karma ?? 0 },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-base font-black text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick info */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">About</h2>
        {worker?.bio && (
          <p className="text-sm text-muted leading-relaxed">{worker.bio}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-muted">
          {worker?.suburb && (
            <span>📍 {worker.suburb}{worker.state ? `, ${worker.state}` : ""}</span>
          )}
          {worker?.years_experience != null && (
            <span>⏱ {worker.years_experience} yr{worker.years_experience !== 1 ? "s" : ""} experience</span>
          )}
          {worker?.hourly_rate_min != null && (
            <span>💰 From ${worker.hourly_rate_min}/hr</span>
          )}
        </div>
        {worker?.skills && worker.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {worker.skills.map((skill: string) => (
              <Badge key={skill} variant="muted" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Payout setup */}
      {!worker?.stripe_account_id && (
        <div className="bg-surface rounded-2xl border border-border p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1">Payout setup</h2>
          <p className="text-xs text-muted mb-3">
            Connect your bank account to receive shift earnings directly.
          </p>
          <Button variant="secondary" size="sm">
            Set up Stripe payout →
          </Button>
        </div>
      )}

      {/* Review history */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Reviews</h2>

        {/* Tabs */}
        <div className="flex gap-0 bg-background rounded-xl border border-border w-fit mb-4 overflow-hidden">
          {REVIEW_TABS.map((t) => (
            <Link key={t} href={`/worker/profile?tab=${encodeURIComponent(t)}`}>
              <span
                className={`px-5 py-2 text-sm font-medium transition-all inline-block ${
                  activeTab === t
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t}
              </span>
            </Link>
          ))}
        </div>

        {!reviews || reviews.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-8 text-center">
            <p className="text-3xl mb-2">⭐</p>
            <p className="text-sm text-muted">No reviews yet.</p>
          </div>
        ) : activeTab === "Worked at" ? (
          /* Group by business */
          <div className="space-y-3">
            {Object.values(businessGroups).map((group) => (
              <div
                key={group.businessName}
                className="bg-surface rounded-2xl border border-border overflow-hidden"
              >
                {/* Business header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 overflow-hidden">
                    {group.logoUrl ? (
                      <Image
                        src={group.logoUrl}
                        alt={group.businessName}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-base">☕</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {group.businessName}
                    </p>
                    <p className="text-xs text-muted">
                      {group.reviews?.length ?? 0} shift{(group.reviews?.length ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Reviews */}
                <div className="divide-y divide-border">
                  {(group.reviews ?? []).map((review) => {
                    const shift = review.shift as {
                      title: string;
                      start_time: string;
                    } | null;
                    return (
                      <div key={review.id} className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${i < review.rating ? "text-brand" : "text-border"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-muted">
                            {formatShortDate(review.created_at)}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-xs text-muted mt-1.5 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Recent — flat list sorted by date */
          <div className="bg-surface rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {reviews.map((review) => {
              const shift = review.shift as {
                title: string;
                start_time: string;
                business: { business_name: string; logo_url?: string } | null;
              } | null;
              const biz = shift?.business;
              return (
                <div key={review.id} className="flex items-start gap-3 px-4 py-3">
                  {/* Business logo */}
                  <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                    {biz?.logo_url ? (
                      <Image
                        src={biz.logo_url}
                        alt={biz.business_name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-base">☕</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {biz?.business_name ?? "Business"}
                        </p>
                        <p className="text-xs text-muted">Barista</p>
                      </div>
                      <span className="text-xs text-muted shrink-0">
                        {formatShortDate(review.created_at)}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${i < review.rating ? "text-brand" : "text-border"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    {review.comment && (
                      <p className="text-xs text-muted mt-1.5 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
