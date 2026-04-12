import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShiftCard } from "@/components/shifts/ShiftCard";
import type { Shift } from "@/lib/types";

export const metadata = { title: "Home" };

export default async function WorkerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: userRow } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();

  // Upcoming booked shifts
  const { data: bookedShifts } = await supabase
    .from("shifts")
    .select(`
      *,
      business:business_profiles(business_name, logo_url, suburb, state, avg_rating)
    `)
    .eq("filled_by_worker_id", user.id)
    .in("status", ["FILLED", "IN_PROGRESS"])
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(3);

  // Nearby open shifts (quick preview)
  const { data: nearbyShifts } = await supabase
    .from("shifts")
    .select(`
      *,
      business:business_profiles(business_name, logo_url, suburb, state, avg_rating),
      application_count:applications(count)
    `)
    .eq("status", "OPEN")
    .eq("job_type", "TEMP")
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(5);

  // Pending applications
  const { data: pendingApps } = await supabase
    .from("applications")
    .select("id, status, shift:shifts(title, start_time, suburb)")
    .eq("worker_id", user.id)
    .in("status", ["PENDING", "OFFERED"])
    .order("created_at", { ascending: false })
    .limit(3);

  const firstName = userRow?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black text-foreground">
          {greeting}, {firstName} ☕
        </h1>
        <p className="text-sm text-muted">
          {nearbyShifts?.length ?? 0} shifts available near you
        </p>
      </div>

      {/* Pending offers */}
      {pendingApps && pendingApps.some((a) => a.status === "OFFERED") && (
        <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4">
          <p className="text-sm font-semibold text-warning mb-2">
            🎉 You have a job offer!
          </p>
          {pendingApps
            .filter((a) => a.status === "OFFERED")
            .map((app) => {
              const shift = app.shift as { title: string; start_time: string; suburb: string } | null;
              return (
                <div key={app.id} className="flex items-center justify-between">
                  <p className="text-sm text-foreground">{shift?.title}</p>
                  <Link href={`/worker/shifts?application=${app.id}`}>
                    <Button size="sm">Accept or decline</Button>
                  </Link>
                </div>
              );
            })}
        </div>
      )}

      {/* Upcoming shifts */}
      {bookedShifts && bookedShifts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">
              Your upcoming shifts
            </h2>
            <Link href="/worker/shifts" className="text-xs text-brand hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {(bookedShifts as unknown as Shift[]).map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                href={`/worker/shifts/${shift.id}`}
                showDistance={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Browse shifts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">
            Shifts near you
          </h2>
          <Link href="/worker/shifts" className="text-xs text-brand hover:underline">
            Browse all →
          </Link>
        </div>

        {nearbyShifts && nearbyShifts.length > 0 ? (
          <div className="space-y-2">
            {(nearbyShifts as unknown as Shift[]).map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                href={`/worker/shifts/${shift.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border p-8 text-center">
            <p className="text-3xl mb-3">☕</p>
            <p className="text-muted text-sm">
              No shifts available right now — check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
