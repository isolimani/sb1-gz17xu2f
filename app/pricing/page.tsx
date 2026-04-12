import { TopNav, Footer } from "@/components/layout/TopNav";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Pricing — Cuppa" };

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />

      <main className="flex-1">
        {/* Header */}
        <section className="max-w-3xl mx-auto px-4 pt-20 pb-12 text-center">
          <h1 className="text-4xl font-black text-foreground mb-4">
            Simple, fair pricing
          </h1>
          <p className="text-lg text-muted">
            One fee. Charged to businesses only. Baristas always keep 100%.
          </p>
        </section>

        {/* Pricing cards */}
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Barista card */}
            <div className="bg-surface rounded-3xl border border-border p-8">
              <p className="text-sm font-semibold text-brand mb-4">For baristas</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-5xl font-black text-foreground">0%</span>
                <span className="text-muted mb-2">fee always</span>
              </div>
              <ul className="space-y-3 text-sm text-foreground/80 mb-8">
                {[
                  "Keep 100% of your advertised rate",
                  "Apply to unlimited shifts",
                  "Verified profile badge",
                  "Karma & completion rate tracking",
                  "Same-day payouts via Stripe",
                  "In-app chat with businesses",
                  "Push notifications for offers",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-success shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="w-full">Join as a barista — free</Button>
              </Link>
            </div>

            {/* Business card */}
            <div className="bg-surface rounded-3xl border-2 border-brand p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                  Lowest fee in AU
                </span>
              </div>
              <p className="text-sm font-semibold text-brand mb-4">For businesses</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-black text-foreground">7%</span>
                <span className="text-muted mb-2">per shift</span>
              </div>
              <p className="text-xs text-muted mb-6">
                Added on top of the barista rate — shown upfront before you publish
              </p>
              <ul className="space-y-3 text-sm text-foreground/80 mb-8">
                {[
                  "Post unlimited shifts",
                  "Review all applicants with full profiles",
                  "Offer/accept 2-step confirmation",
                  "Auto-generated invoices with PDF",
                  "Manual or Stripe payment",
                  "Clock-in / clock-out hour tracking",
                  "Review baristas after shifts",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-success shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="w-full">Post your first shift</Button>
              </Link>
            </div>
          </div>

          {/* Fee calculator */}
          <div className="mt-10 bg-surface rounded-3xl border border-border p-8">
            <h2 className="text-lg font-bold text-foreground mb-6">
              Example: 7-hour shift at $42/hr
            </h2>
            <div className="space-y-3 text-sm">
              {[
                { label: "Gross pay (7 hrs × $42)", value: "$294.00", sub: "What the barista earns" },
                { label: "Platform fee (7%)", value: "+ $20.58", sub: "Charged to business only" },
                { label: "Business pays total", value: "$314.58", bold: true },
                { label: "Barista receives", value: "$294.00", highlight: true, sub: "Zero deductions" },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between py-3 border-b border-border last:border-0 ${
                    row.highlight ? "bg-success/5 -mx-4 px-4 rounded-xl" : ""
                  }`}
                >
                  <div>
                    <p className={row.bold ? "font-bold text-foreground" : "text-foreground"}>
                      {row.label}
                    </p>
                    {row.sub && <p className="text-xs text-muted">{row.sub}</p>}
                  </div>
                  <p
                    className={`font-bold ${
                      row.highlight
                        ? "text-success text-base"
                        : row.bold
                        ? "text-foreground text-base"
                        : "text-foreground"
                    }`}
                  >
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground text-center mb-6">
              How we compare
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-6 text-muted font-medium">Platform</th>
                    <th className="text-right py-3 pr-6 text-muted font-medium">Fee</th>
                    <th className="text-right py-3 text-muted font-medium">Charged to</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { platform: "Cuppa ☕", fee: "7%", to: "Business only", highlight: true },
                    { platform: "Competitor A", fee: "10–15%", to: "Business + Worker" },
                    { platform: "Competitor B", fee: "~20%", to: "Business" },
                    { platform: "Competitor C", fee: "~25%", to: "Worker" },
                  ].map((row) => (
                    <tr
                      key={row.platform}
                      className={`border-b border-border ${
                        row.highlight ? "bg-brand/5 font-semibold" : ""
                      }`}
                    >
                      <td className={`py-3 pr-6 ${row.highlight ? "text-brand" : "text-foreground"}`}>
                        {row.platform}
                      </td>
                      <td className={`py-3 pr-6 text-right ${row.highlight ? "text-brand" : "text-foreground"}`}>
                        {row.fee}
                      </td>
                      <td className={`py-3 text-right ${row.highlight ? "text-brand" : "text-muted"}`}>
                        {row.to}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-surface border-t border-border py-16">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-black text-foreground text-center mb-10">FAQ</h2>
            <div className="space-y-6">
              {[
                {
                  q: "Are there any hidden fees?",
                  a: "No. The 7% fee is the only charge. It is displayed before you confirm any shift, and baristas never pay anything.",
                },
                {
                  q: "How are payouts processed?",
                  a: "Baristas connect a Stripe Express account during onboarding. Once a business confirms your hours and payment clears, your earnings are transferred directly to your bank account.",
                },
                {
                  q: "What if I need to cancel?",
                  a: "Cancel as early as possible. Cancellations within 24 hours affect your Completion Rate. Repeated late cancellations may result in account suspension.",
                },
                {
                  q: "Is there a free trial?",
                  a: "For the first 90 days after launch, all businesses post shifts with 0% fee as part of our founding cohort offer.",
                },
              ].map((faq) => (
                <div key={faq.q} className="border-b border-border pb-6">
                  <p className="font-semibold text-foreground mb-2">{faq.q}</p>
                  <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
