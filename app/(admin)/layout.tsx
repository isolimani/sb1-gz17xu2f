import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "◻" },
  { href: "/admin/baristas", label: "Vetting queue", icon: "✓" },
  { href: "/admin/reviews", label: "Manual reviews", icon: "★" },
];

export default async function AdminLayout({
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
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!userRow?.is_admin) redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-52 shrink-0 flex-col bg-foreground">
        <div className="h-14 flex items-center px-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">☕</span>
            <span className="font-black text-surface text-sm">
              cuppa admin
            </span>
          </Link>
        </div>
        <nav className="flex-1 py-3 px-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors mb-0.5"
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 max-w-5xl w-full mx-auto">{children}</main>
    </div>
  );
}
