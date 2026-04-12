import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/ui/Card";
import { formatAUD } from "@/lib/utils/currency";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalWorkers },
    { count: pendingVetting },
    { count: totalShifts },
    { count: completedShifts },
    { data: revenue },
  ] = await Promise.all([
    supabase
      .from("worker_profiles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("worker_profiles")
      .select("*", { count: "exact", head: true })
      .eq("vetting_status", "PENDING"),
    supabase.from("shifts").select("*", { count: "exact", head: true }),
    supabase
      .from("shifts")
      .select("*", { count: "exact", head: true })
      .eq("status", "COMPLETED"),
    supabase
      .from("transactions")
      .select("platform_fee_amount")
      .eq("status", "COMPLETED"),
  ]);

  const totalRevenue = (revenue ?? []).reduce(
    (sum, t) => sum + (t.platform_fee_amount ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-foreground">Platform overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total workers"
          value={totalWorkers ?? 0}
          icon={<span>👤</span>}
        />
        <StatCard
          label="Pending vetting"
          value={pendingVetting ?? 0}
          highlight={(pendingVetting ?? 0) > 0}
          icon={<span>⏳</span>}
        />
        <StatCard
          label="Completed shifts"
          value={completedShifts ?? 0}
          icon={<span>✓</span>}
        />
        <StatCard
          label="Platform revenue"
          value={formatAUD(totalRevenue)}
          highlight={totalRevenue > 0}
          icon={<span>💰</span>}
        />
      </div>

      <div className="bg-surface rounded-2xl border border-border p-6">
        <h2 className="font-semibold text-foreground mb-3">Quick actions</h2>
        <div className="space-y-2 text-sm text-muted">
          <a href="/admin/baristas" className="block hover:text-brand">
            → Review pending barista profiles ({pendingVetting ?? 0})
          </a>
          <a href="/admin/reviews" className="block hover:text-brand">
            → Add manual reviews for migrated workers
          </a>
        </div>
      </div>
    </div>
  );
}
