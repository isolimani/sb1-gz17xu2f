import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { formatAUD } from "@/lib/utils/currency";
import { formatShortDate } from "@/lib/utils/date";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfMonth,
  subMonths,
  parseISO,
  getMonth,
  format,
} from "date-fns";

export const metadata = { title: "Earnings" };

const PERIODS = ["Week", "Month", "Year"] as const;

export default async function WorkerEarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const activePeriod = (period as (typeof PERIODS)[number]) ?? "Month";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch worker stripe status
  const { data: worker } = await supabase
    .from("worker_profiles")
    .select("stripe_account_id, avg_rating, total_shifts_completed, karma, completion_rate")
    .eq("user_id", user.id)
    .single();

  // All invoices for this worker
  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      *,
      business:business_profiles(business_name, logo_url),
      transaction:transactions(total_hours, hourly_rate, gross_amount)
    `)
    .eq("worker_id", user.id)
    .order("created_at", { ascending: false });

  const now = new Date();

  // Period filter for stats
  let periodStart: Date;
  if (activePeriod === "Week") {
    periodStart = startOfWeek(now, { weekStartsOn: 1 });
  } else if (activePeriod === "Year") {
    periodStart = startOfYear(now);
  } else {
    periodStart = startOfMonth(now);
  }

  const periodInvoices = (invoices ?? []).filter(
    (inv) => new Date(inv.created_at) >= periodStart
  );

  const totalEarned = periodInvoices.reduce(
    (s, inv) => s + ((inv.transaction as { gross_amount: number } | null)?.gross_amount ?? inv.total_amount),
    0
  );
  const totalShifts = periodInvoices.length;
  const totalHours = periodInvoices.reduce(
    (s, inv) => s + ((inv.transaction as { total_hours: number } | null)?.total_hours ?? 0),
    0
  );

  // Bar chart data — last 8 months
  const monthBars = Array.from({ length: 8 }, (_, i) => {
    const d = subMonths(now, 7 - i);
    const monthInvoices = (invoices ?? []).filter((inv) => {
      const invDate = parseISO(inv.created_at);
      return getMonth(invDate) === getMonth(d) && invDate.getFullYear() === d.getFullYear();
    });
    const amount = monthInvoices.reduce(
      (s, inv) => s + ((inv.transaction as { gross_amount: number } | null)?.gross_amount ?? inv.total_amount),
      0
    );
    return { label: format(d, "MMM"), amount };
  });

  const maxBar = Math.max(...monthBars.map((b) => b.amount), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground">Earnings</h1>
      </div>

      {/* Stripe Connect CTA */}
      {!worker?.stripe_account_id && (
        <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl mt-0.5">💳</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Set up payouts to receive your earnings
            </p>
            <p className="text-xs text-muted mt-0.5">
              Connect your bank account via Stripe to receive same-day payouts.
            </p>
          </div>
          <Link href="/worker/profile?section=payout">
            <span className="text-xs font-semibold text-brand whitespace-nowrap">
              Set up →
            </span>
          </Link>
        </div>
      )}

      {/* Period selector */}
      <div className="flex gap-1 bg-background rounded-xl p-1 w-fit border border-border">
        {PERIODS.map((p) => (
          <Link key={p} href={`/worker/earnings?period=${p}`}>
            <span
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all inline-block ${
                activePeriod === p
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {p}
            </span>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Earned", value: formatAUD(totalEarned) },
          { label: "Shifts", value: totalShifts },
          { label: "Hours", value: totalHours.toFixed(1) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-2xl border border-border p-4 text-center"
          >
            <p className="text-xs text-muted uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p className="text-xl font-black text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">
          Monthly earnings
        </p>
        <div className="flex items-end gap-1.5 h-24">
          {monthBars.map((bar) => (
            <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-brand/80 transition-all"
                style={{ height: `${(bar.amount / maxBar) * 100}%`, minHeight: bar.amount > 0 ? "4px" : "2px" }}
              />
              <span className="text-[9px] text-muted font-medium">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Career stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Avg rating", value: worker?.avg_rating?.toFixed(1) ?? "–" },
          { label: "Shifts done", value: worker?.total_shifts_completed ?? 0 },
          { label: "Completion rate", value: `${worker?.completion_rate ?? 100}%` },
          { label: "Karma", value: worker?.karma ?? 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-2xl border border-border p-3 flex items-center gap-3"
          >
            <div>
              <p className="text-xs text-muted">{stat.label}</p>
              <p className="text-base font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          Payment history
        </h2>
        {!invoices || invoices.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-8 text-center">
            <p className="text-3xl mb-2">🧾</p>
            <p className="text-sm text-muted">
              Your earnings will appear here after completing shifts.
            </p>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {invoices.map((inv) => {
              const biz = inv.business as { business_name: string; logo_url?: string } | null;
              const txn = inv.transaction as { gross_amount: number; total_hours: number; hourly_rate: number } | null;
              return (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-background/50 transition-colors"
                >
                  {/* Business logo placeholder */}
                  <div className="h-9 w-9 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                    <span className="text-base">☕</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {biz?.business_name ?? "Business"}
                    </p>
                    <p className="text-xs text-muted">
                      {formatShortDate(inv.issued_date)}
                      {txn && ` · ${txn.total_hours.toFixed(1)} hrs × $${txn.hourly_rate}/hr`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={inv.status} />
                    <p className="text-sm font-bold text-foreground w-16 text-right">
                      {formatAUD(txn?.gross_amount ?? inv.total_amount)}
                    </p>
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
