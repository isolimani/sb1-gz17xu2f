import Link from "next/link";
import { TopNav, Footer } from "@/components/layout/TopNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const MOCK_SHIFTS = [
  {
    id: "1",
    business: "The Brew Co",
    day: "SAT",
    date: "12",
    month: "APR",
    time: "7:00am – 2:00pm",
    hours: "7 hrs",
    pay: "$294",
    rate: "$42/hr",
    suburb: "Fitzroy",
    skills: ["Espresso", "Latte art"],
  },
  {
    id: "2",
    business: "Alba Espresso",
    day: "SUN",
    date: "13",
    month: "APR",
    time: "8:00am – 12:00pm",
    hours: "4 hrs",
    pay: "$152",
    rate: "$38/hr",
    suburb: "Richmond",
    skills: ["Pour-over", "Specialty"],
  },
  {
    id: "3",
    business: "Goodside Coffee",
    day: "MON",
    date: "14",
    month: "APR",
    time: "6:30am – 1:00pm",
    hours: "6.5 hrs",
    pay: "$273",
    rate: "$42/hr",
    suburb: "Collingwood",
    skills: ["Espresso", "Rush service"],
  },
];

const STEPS_BUSINESS = [
  {
    icon: "📋",
    title: "Post a shift in 2 minutes",
    desc: "Add date, time, rate, and required skills. Your listing is live immediately.",
  },
  {
    icon: "👤",
    title: "Review applicants",
    desc: "See barista profiles, ratings, completion rates, and karma scores. Pick your match.",
  },
  {
    icon: "✅",
    title: "Confirm & pay",
    desc: "Barista clocks in/out via app. Hours confirmed, invoice auto-generated. Done.",
  },
];

const STEPS_WORKER = [
  {
    icon: "🔍",
    title: "Browse local shifts",
    desc: "Filter by date, pay rate, and distance. See estimated total pay upfront.",
  },
  {
    icon: "💬",
    title: "Apply with a message",
    desc: "Send a personal cover note. Businesses read them — it gets you noticed.",
  },
  {
    icon: "💰",
    title: "Work & get paid",
    desc: "Clock in/out on the app. Payment within 48 hours. Keep 100% of your rate.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We filled our Saturday shift in 40 minutes. The barista was exactly what we needed — 5 stars, we booked her again.",
    name: "The Brew Co",
    role: "Café owner, Fitzroy",
    avatar: "TB",
  },
  {
    quote:
      "I work 2–3 shifts a week on top of my regular job. Cuppa pays fast and I keep every dollar I earn.",
    name: "Samantha T.",
    role: "Freelance barista, Melbourne",
    avatar: "ST",
  },
  {
    quote:
      "Switching from another platform saved us $280 last month in fees alone. Cuppa just makes sense.",
    name: "Allpress Espresso",
    role: "Café manager, Freshwater",
    avatar: "AE",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-surface pt-16 pb-20 px-4 overflow-hidden">
        {/* Background circles */}
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-brand/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <Badge variant="brand" className="mb-5">
                🇦🇺 &nbsp;Made in Australia · Only 7% platform fee
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black text-foreground leading-[1.1] tracking-tight mb-5">
                Find & hire{" "}
                <span className="text-brand">skilled baristas</span>
                <br />
                for any shift.
              </h1>
              <p className="text-lg text-muted leading-relaxed mb-8 max-w-md">
                Australia&apos;s lowest-fee staffing platform for specialty
                coffee. Post a shift, review vetted baristas, and pay just{" "}
                <strong className="text-foreground">7%</strong> — baristas keep{" "}
                <strong className="text-foreground">100%</strong> of their rate.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/auth/signup?role=business">
                  <Button size="lg">Post a shift free</Button>
                </Link>
                <Link href="/auth/signup?role=worker">
                  <Button size="lg" variant="outline">
                    Find shifts near me
                  </Button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="text-success">✓</span> No lock-in contracts
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-success">✓</span> Vetted baristas only
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-success">✓</span> Pay within 48h
                </span>
              </div>
            </div>

            {/* Right — Shift feed preview */}
            <div className="relative">
              <div className="space-y-3">
                {MOCK_SHIFTS.map((shift, i) => (
                  <div
                    key={shift.id}
                    className={`bg-surface rounded-2xl border border-border p-4 flex gap-3 shadow-sm ${
                      i === 1 ? "ring-2 ring-brand/30" : ""
                    }`}
                  >
                    {/* Date chip */}
                    <div className="w-11 h-12 rounded-xl border border-border bg-background flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-muted">
                        {shift.day}
                      </span>
                      <span className="text-lg font-black text-foreground leading-none">
                        {shift.date}
                      </span>
                      <span className="text-[9px] font-bold text-muted">
                        {shift.month}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {shift.business}
                          </p>
                          <p className="text-xs text-muted">
                            {shift.time} · {shift.hours}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">
                            {shift.pay}
                          </p>
                          <p className="text-xs text-muted">{shift.rate}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-1">
                          {shift.skills.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-background text-muted border border-border"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-medium text-brand">
                          {shift.suburb}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                12 shifts near you
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logos / Social proof ─────────────────────────────── */}
      <section className="bg-background border-y border-border py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-6">
            Trusted by cafés and baristas across Australia
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-muted">
            {[
              "The Brew Co",
              "Alba Espresso",
              "Goodside Coffee",
              "Allpress",
              "Mooks Café",
              "Tempus Labs",
            ].map((name) => (
              <span
                key={name}
                className="text-sm font-semibold opacity-50 hover:opacity-80 transition-opacity"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Fee comparison ────────────────────────────────────── */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-foreground mb-4">
            The lowest fee in Australia. By far.
          </h2>
          <p className="text-muted mb-12 max-w-lg mx-auto">
            Other platforms take 10–25% from businesses, and sometimes from
            baristas too. Cuppa charges just 7% — and workers keep every dollar.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { platform: "Others", fee: "10–25%", from: "Business + worker", highlight: false },
              { platform: "Cuppa ☕", fee: "7%", from: "Business only", highlight: true },
              { platform: "Manual hiring", fee: "0%", from: "But hours of your time", highlight: false },
            ].map((item) => (
              <div
                key={item.platform}
                className={`rounded-2xl border p-6 text-center ${
                  item.highlight
                    ? "border-brand bg-brand text-white shadow-xl scale-105"
                    : "border-border bg-background"
                }`}
              >
                <p
                  className={`font-bold text-sm mb-2 ${
                    item.highlight ? "text-white/80" : "text-muted"
                  }`}
                >
                  {item.platform}
                </p>
                <p
                  className={`text-4xl font-black mb-1 ${
                    item.highlight ? "text-white" : "text-foreground"
                  }`}
                >
                  {item.fee}
                </p>
                <p
                  className={`text-xs ${
                    item.highlight ? "text-white/70" : "text-muted"
                  }`}
                >
                  {item.from}
                </p>
              </div>
            ))}
          </div>

          {/* Example calc */}
          <div className="mt-10 bg-brand-50 rounded-2xl border border-brand/20 p-6 text-left max-w-lg mx-auto">
            <p className="text-sm font-semibold text-brand mb-3">
              📊 Real example — Saturday morning shift
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Barista rate</span>
                <span className="font-medium">$42/hr × 7 hrs = $294</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Cuppa fee (7%)</span>
                <span className="font-medium text-brand">+ $20.58</span>
              </div>
              <div className="flex justify-between border-t border-brand/20 pt-2 mt-2">
                <span className="font-semibold">Business pays</span>
                <span className="font-bold">$314.58 total</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-success">Barista receives</span>
                <span className="font-bold text-success">$294.00 (100%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works — Business ──────────────────────────── */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="muted" className="mb-4">
              For businesses
            </Badge>
            <h2 className="text-3xl font-black text-foreground">
              Fill a shift in minutes, not days
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS_BUSINESS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-xs font-bold text-brand uppercase tracking-widest mb-2">
                  Step {i + 1}
                </div>
                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/auth/signup?role=business">
              <Button size="lg">Post your first shift free</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How it works — Barista ───────────────────────────── */}
      <section className="py-20 px-4 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="brand" className="mb-4">
              For baristas
            </Badge>
            <h2 className="text-3xl font-black text-foreground">
              Work when you want. Keep what you earn.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS_WORKER.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-xs font-bold text-brand uppercase tracking-widest mb-2">
                  Step {i + 1}
                </div>
                <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Download CTA */}
          <div className="text-center mt-10 space-y-4">
            <p className="text-sm text-muted">
              Download the Cuppa app to browse shifts on the go
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-foreground text-surface px-5 py-3 rounded-xl hover:bg-foreground/90 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] leading-none opacity-70">
                    Download on the
                  </div>
                  <div className="text-sm font-semibold leading-tight">
                    App Store
                  </div>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-foreground text-surface px-5 py-3 rounded-xl hover:bg-foreground/90 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3.18 23.76c.31.17.66.22 1.02.14l12.2-7.05-2.66-2.67-10.56 9.58zM20.7 10.06L17.76 8.4 14.84 11l2.98 2.98 2.89-1.67c.82-.48.82-1.77-.01-2.25zM1.02.1C.69.27.44.62.44 1.08v21.77c0 .46.25.81.58.99L13.65 12 1.02.1zm13.27 12.23l-2.98 2.98 2.98 2.98 2.98-2.98-2.98-2.98z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] leading-none opacity-70">
                    Get it on
                  </div>
                  <div className="text-sm font-semibold leading-tight">
                    Google Play
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────── */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-foreground text-center mb-12">
            What people are saying
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-surface rounded-2xl border border-border p-6"
              >
                <div className="text-brand text-lg mb-3">★★★★★</div>
                <p className="text-sm text-foreground leading-relaxed mb-4 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-light text-brand flex items-center justify-center text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-brand">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-black mb-4">
            Ready to brew something great?
          </h2>
          <p className="text-white/80 mb-8">
            Join hundreds of cafés and baristas already using Cuppa.
            No lock-in. Cancel anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/signup?role=business">
              <Button
                size="lg"
                className="bg-white text-brand hover:bg-white/90 font-bold"
              >
                Post a shift — it&apos;s free
              </Button>
            </Link>
            <Link href="/auth/signup?role=worker">
              <Button
                size="lg"
                className="bg-white/10 text-white border border-white/30 hover:bg-white/20 font-semibold"
              >
                Find barista shifts
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
