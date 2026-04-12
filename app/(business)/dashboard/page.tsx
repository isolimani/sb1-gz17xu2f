import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { ShiftListRow } from "@/components/shifts/ShiftCard";
import { formatAUD } from "@/lib/utils/currency";
import { formatShortDate } from "@/lib/utils/date";
import type { Shift, Invoice } from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default async function BusinessDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch open shifts
  const { data: openShifts } = await supabase
    .from("shifts")
    .select(`
      *,
      business:business_profiles(business_name, logo_url, suburb, state),
      application_count:applications(count)
    `)
    .eq("business_id", user.id)
    .in("status", ["OPEN", "FILLED", "IN_PROGRESS"])
    .order("start_time", { ascending: true })
    .limit(10);

  // Fetch recent invoices
  const { data: recentInvoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("business_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Stats
  const { count: openCount } = await supabase
    .from("shifts")
    .select("*", { count: "exact", head: true })
    .eq("business_id", user.id)
    .eq("status", "OPEN");

  const { count: filledCount } = await supabase
    .from("shifts")
    .select("*", { count: "exact", head: true })
    .eq("business_id", user.id)
    .in("status", ["FILLED", "IN_PROGRESS"]);

  const { data: monthSpend } = await supabase
    .from("transactions")
    .select("business_total")
    .eq("business_id", user.id)
    .eq("status", "COMPLETED")
    .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const totalSpend = (monthSpend ?? []).reduce(
    (sum, t) => sum + (t.business_total ?? 0),
    0
  );

  const pendingInvoiceCount = (recentInvoices ?? []).filter(
    (inv) => inv.status === "SENT" || inv.status === "OVERDUE"
  ).length;

  const typedShifts = (openShifts ?? []) as unknown as Shift[];
  const typedInvoices = (recentInvoices ?? []) as unknown as Invoice[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Dashboard</h1>
          <p className="text-sm text-muted">
            {new Date().toLocaleDateString("en-AU", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <Link href="/business/post-shift">
          <Button>+ Post a shift</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Open shifts"
          value={openCount ?? 0}
          icon={<span>📢</span>}
        />
        <StatCard
          label="Upcoming"
          value={filledCount ?? 0}
          icon={<span>📅</span>}
        />
        <StatCard
          label="Pending invoices"
          value={pendingInvoiceCount}
          icon={<span>🧾</span>}
          highlight={pendingInvoiceCount > 0}
        />
        <StatCard
          label="Spent this month"
          value={formatAUD(totalSpend)}
          icon={<span>💰</span>}
        />
      </div>

      {/* Active shifts */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-foreground">
            Active shifts
          </h2>
          <Link
            href="/business/shifts"
            className="text-xs text-brand hover:underline"
          >
            View all →
          </Link>
        </div>

        {typedShifts.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted text-sm mb-3">No active shifts</p>
            <Link href="/business/post-shift">
              <Button variant="secondary" size="sm">
                Post your first shift
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            {typedShifts.map((shift) => (
              <ShiftListRow
                key={shift.id}
                shift={shift}
                href={`/business/shifts/${shift.id}/applications`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent invoices */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Recent invoices
          </h2>
          <Link
            href="/business/invoices"
            className="text-xs text-brand hover:underline"
          >
            View all →
          </Link>
        </div>

        {typedInvoices.length === 0 ? (
          <p className="text-muted text-sm py-4 text-center">
            No invoices yet. Invoices are generated automatically after shift
            completion.
          </p>
        ) : (
          <div className="space-y-0">
            {typedInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {inv.invoice_number}
                  </p>
                  <p className="text-xs text-muted">
                    {formatShortDate(inv.issued_date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={inv.status} />
                  <p className="text-sm font-bold text-foreground">
                    {formatAUD(inv.total_amount)}
                  </p>
                  <Link
                    href={`/business/invoices/${inv.id}`}
                    className="text-xs text-brand hover:underline"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
