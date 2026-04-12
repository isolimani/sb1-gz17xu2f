import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShiftCard } from "@/components/shifts/ShiftCard";
import { Button } from "@/components/ui/Button";
import type { Shift } from "@/lib/types";

export const metadata = { title: "Find shifts" };

const JOB_TYPE_TABS = ["TEMP", "PERM"] as const;

export default async function WorkerShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; suburb?: string; minRate?: string }>;
}) {
  const { tab, suburb, minRate } = await searchParams;
  const activeTab = tab === "PERM" ? "PERM" : "TEMP";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch my active applications (to show apply status on cards)
  const { data: myApps } = await supabase
    .from("applications")
    .select("shift_id, status")
    .eq("worker_id", user.id)
    .in("status", ["PENDING", "OFFERED", "ACCEPTED"]);

  const appliedShiftIds = new Set((myApps ?? []).map((a) => a.shift_id));

  // Build open shifts query
  let query = supabase
    .from("shifts")
    .select(`
      *,
      business:business_profiles(business_name, logo_url, suburb, state, avg_rating, karma)
    `)
    .eq("status", "OPEN")
    .eq("job_type", activeTab)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (suburb) {
    query = query.ilike("suburb", `%${suburb}%`);
  }
  if (minRate) {
    const rate = parseFloat(minRate);
    if (!isNaN(rate)) query = query.gte("hourly_rate", rate);
  }

  const { data: shifts } = await query.limit(30);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground">Find shifts</h1>
        <p className="text-sm text-muted mt-0.5">
          {shifts?.length ?? 0} shifts available
        </p>
      </div>

      {/* TEMP / PERM tabs */}
      <div className="flex gap-1 bg-background rounded-xl p-1 w-fit border border-border">
        {JOB_TYPE_TABS.map((t) => (
          <Link
            key={t}
            href={`/worker/shifts?tab=${t}${suburb ? `&suburb=${suburb}` : ""}${minRate ? `&minRate=${minRate}` : ""}`}
          >
            <span
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all inline-block ${
                activeTab === t
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t === "TEMP" ? "Casual" : "Permanent"}
            </span>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <form
        method="GET"
        action="/worker/shifts"
        className="flex gap-2 flex-wrap"
      >
        <input type="hidden" name="tab" value={activeTab} />
        <input
          type="text"
          name="suburb"
          defaultValue={suburb ?? ""}
          placeholder="Suburb"
          className="px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-brand/50 w-36"
        />
        <input
          type="number"
          name="minRate"
          defaultValue={minRate ?? ""}
          placeholder="Min $/hr"
          min="0"
          step="5"
          className="px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-brand/50 w-28"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
        >
          Filter
        </button>
        {(suburb || minRate) && (
          <Link href={`/worker/shifts?tab=${activeTab}`}>
            <span className="px-4 py-2 rounded-xl border border-border text-sm text-muted hover:text-foreground transition-colors inline-block">
              Clear
            </span>
          </Link>
        )}
      </form>

      {/* Shift feed */}
      {!shifts || shifts.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-10 text-center">
          <p className="text-4xl mb-3">☕</p>
          <p className="text-muted text-sm mb-2">
            No {activeTab === "TEMP" ? "casual" : "permanent"} shifts available right now.
          </p>
          <p className="text-xs text-muted">
            Try clearing filters or check back soon.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(shifts as unknown as Shift[]).map((shift) => {
            const alreadyApplied = appliedShiftIds.has(shift.id);
            return (
              <div key={shift.id} className="relative">
                <ShiftCard
                  shift={shift}
                  href={`/worker/shifts/${shift.id}`}
                />
                {alreadyApplied && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-semibold bg-brand/10 text-brand px-2 py-0.5 rounded-full border border-brand/20">
                      Applied
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
