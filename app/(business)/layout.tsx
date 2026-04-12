import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV_ITEMS = [
  { href: "/business/dashboard", label: "Dashboard", icon: "◻" },
  { href: "/business/post-shift", label: "Post a shift", icon: "+" },
  { href: "/business/shifts", label: "My shifts", icon: "📋" },
  { href: "/business/invoices", label: "Invoices", icon: "🧾" },
  { href: "/business/settings", label: "Settings", icon: "⚙" },
];

export default async function BusinessLayout({
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
    .select("name, avatar_url, has_business_profile")
    .eq("id", user.id)
    .single();

  if (!userRow?.has_business_profile) {
    redirect("/auth/onboarding/business");
  }

  const { data: business } = await supabase
    .from("business_profiles")
    .select("business_name, type")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col bg-surface border-r border-border">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">☕</span>
            <span className="font-black text-foreground">cuppa</span>
          </Link>
        </div>

        {/* Business name */}
        <div className="px-5 py-4 border-b border-border">
          <p className="text-xs font-semibold text-foreground truncate">
            {business?.business_name}
          </p>
          <p className="text-xs text-muted capitalize">
            {business?.type?.toLowerCase()}
          </p>
        </div>

        {/* Nav */}
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

        {/* Bottom links */}
        <div className="px-2 py-3 border-t border-border space-y-0.5">
          <Link
            href="/auth/login"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-error hover:bg-red-50 transition-colors"
          >
            <span className="text-base w-5 text-center">→</span>
            Log out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-40 bg-surface border-b border-border h-14 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">☕</span>
            <span className="font-black text-foreground">cuppa</span>
          </Link>
          <span className="text-xs text-muted">{business?.business_name}</span>
        </header>

        <main className="flex-1 p-6 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
