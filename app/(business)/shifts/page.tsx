import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatShiftRange, formatDateCard } from "@/lib/utils/date";

export const metadata = { title: "My shifts" };

const STATUS_TABS = ["All", "Open", "Filled", "Completed", "Cancelled"] as const;

export default async function BusinessShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  let query = supabase
    .from("shifts")
    .select(`
      *,
      application_count:applications(count),
      filled_worker:users!filled_by_worker_id(name)
    `)
    .eq("business_id", user.id)
    .order("start_time", { ascending: false });

  if (status && status !== "All") {
    query = query.eq("status", status.toUpperCase());
  }

  const { data: shifts } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">My shifts</h1>
        <Link href="/business/post-shift">
          <Button>+ Post a shift</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-background rounded-xl p-1 w-fit border border-border">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab}
            href={tab === "All" ? "/business/shifts" : `/business/shifts?status=${tab}`}
          >
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-block ${
                (!status && tab === "All") || status === tab
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab}
            </span>
          </Link>
        ))}
      </div>

      {/* Shifts */}
      {!shifts || shifts.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-10 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-muted text-sm mb-4">No shifts found</p>
          <Link href="/business/post-shift">
            <Button variant="secondary">Post your first shift</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {shifts.map((shift) => {
            const dateCard = formatDateCard(shift.start_time);
            const timeRange = formatShiftRange(shift.start_time, shift.end_time);
            const appCount = Array.isArray(shift.application_count)
              ? shift.application_count[0]?.count ?? 0
              : 0;
            const workerName = (shift.filled_worker as { name: string } | null)?.name;

            return (
              <div
                key={shift.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-background/50 transition-colors"
              >
                {/* Date chip */}
                <div className="w-11 text-center shrink-0">
                  <p className="text-[9px] font-bold text-muted">{dateCard.day}</p>
                  <p className="text-xl font-black text-foreground leading-none">
                    {dateCard.date}
                  </p>
                  <p className="text-[9px] font-bold text-muted">{dateCard.month}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {shift.title}
                  </p>
                  <p className="text-xs text-muted">
                    {timeRange} · {shift.suburb}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={shift.status} />
                  <p className="text-xs text-muted w-20 text-right">
                    {shift.status === "OPEN"
                      ? `${appCount} applicant${appCount !== 1 ? "s" : ""}`
                      : workerName ?? ""}
                  </p>
                  <Link
                    href={`/business/shifts/${shift.id}/applications`}
                    className="text-xs text-brand hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
