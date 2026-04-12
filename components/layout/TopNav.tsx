import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">☕</span>
          <span className="text-lg font-black text-foreground tracking-tight">
            cuppa
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/how-it-works"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            How it works
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Auth CTA */}
        <div className="flex items-center gap-2">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">Get started free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">☕</span>
              <span className="font-black text-foreground">cuppa</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Australia&apos;s lowest-fee barista hiring platform.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
              For Businesses
            </p>
            <ul className="space-y-2">
              {["Post a shift", "How it works", "Pricing"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-xs text-muted hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
              For Baristas
            </p>
            <ul className="space-y-2">
              {["Find shifts", "Download app", "Community guidelines"].map(
                (item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-xs text-muted hover:text-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
              Company
            </p>
            <ul className="space-y-2">
              {[
                ["About", "/about"],
                ["Contact", "/contact"],
                ["Terms", "/terms"],
                ["Privacy", "/privacy"],
                ["Community Guidelines", "/community-guidelines"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs text-muted hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Cuppa. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-muted hover:text-foreground">
              Instagram
            </Link>
            <Link href="#" className="text-xs text-muted hover:text-foreground">
              Facebook
            </Link>
            <Link href="#" className="text-xs text-muted hover:text-foreground">
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
