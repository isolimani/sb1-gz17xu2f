import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV_ITEMS = [
  { href: "/worker/dashboard", label: "Home", icon: "🏠" },
  { href: "/worker/shifts", label: "Find shifts", icon: "🔍" },
  { href: "/worker/earnings", label: "Earnings", icon: "💰" },
  { href: "/worker/profile", label: "Profile", icon: "👤" },
];

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: userRow } = await supabase
    .from("users")
    .select("name, avatar_url, has_worker_profile, has_business_profile")
    .eq("id", user.id)
    .single();

  if (!userRow?.has_worker_profile) redirect("/auth/onboarding/worker");

  const { data: worker } = await supabase
    .from("worker_profiles")
    .select("avg_rating, karma, total_shifts_completed, completion_rate, vetting_status")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col bg-surface border-r border-border">
        <div className="h-14 flex items-center px-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">☕</span>
            <span className="font-black text-foreground">cuppa</span>
          </Link>
        </div>

        {/* Worker stats */}
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground truncate">
            {userRow.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-brand text-sm">
              {"★".repeat(Math.round(worker?.avg_rating ?? 5))}
            </span>
            <span className="text-xs text-muted">
              {worker?.total_shifts_completed ?? 0} shifts
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted">
              {worker?.completion_rate ?? 100}% completion
            </span>
            <span className="text-xs text-brand font-medium">
              {worker?.karma ?? 0} karma
            </span>
          </div>
        </div>

        {/* Switch to managing */}
        {userRow.has_business_profile && (
          <div className="px-2 pt-3">
            <Link
              href="/business/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted border border-border hover:border-brand/40 hover:text-brand transition-all"
            >
              <span>⇄</span> Switch to Managing
            </Link>
          </div>
        )}

        <nav className="flex-1 py-3 px-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted hover:text-foreground hover:bg-background transition-colors mb-0.5"
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Settings links */}
        <div className="px-2 py-3 border-t border-border space-y-0.5">
          {[
            { href: "/community-guidelines", label: "Community guidelines" },
            { href: "/terms", label: "Terms & Conditions" },
            { href: "/privacy", label: "Privacy Policy" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-xl text-xs text-muted hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="flex items-center px-3 py-2 rounded-xl text-xs text-error hover:bg-red-50 transition-colors"
          >
            Log out
          </Link>
        </div>
      </aside>

      {/* Pending vetting banner */}
      {worker?.vetting_status === "PENDING" && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-warning text-white text-center text-sm py-2 px-4 font-medium">
          ⏳ Your profile is under review. You&apos;ll be notified once approved.
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-40 bg-surface border-b border-border h-14 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">☕</span>
            <span className="font-black text-foreground">cuppa</span>
          </Link>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex z-40">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center py-2 text-muted hover:text-brand transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-6 max-w-3xl w-full mx-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
