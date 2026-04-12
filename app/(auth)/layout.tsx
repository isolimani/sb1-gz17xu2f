import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="py-5 px-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-2xl">☕</span>
          <span className="text-lg font-black text-foreground">cuppa</span>
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Cuppa ·{" "}
        <Link href="/terms" className="hover:text-foreground">
          Terms
        </Link>{" "}
        ·{" "}
        <Link href="/privacy" className="hover:text-foreground">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
