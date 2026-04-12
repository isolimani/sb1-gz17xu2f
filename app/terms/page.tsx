import { TopNav, Footer } from "@/components/layout/TopNav";

export const metadata = { title: "Terms & Conditions — Cuppa" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <h1 className="text-3xl font-black text-foreground mb-2">Terms & Conditions</h1>
        <p className="text-muted text-sm mb-10">Last updated: April 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-base font-bold text-foreground mb-3">1. About Cuppa</h2>
            <p>
              Cuppa is an online marketplace operated by Cuppa Platform Pty Ltd (ABN TBC)
              (&quot;we&quot;, &quot;us&quot;, &quot;Cuppa&quot;) that connects hospitality businesses
              with freelance baristas for casual and permanent employment opportunities. By using
              Cuppa you agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">2. Eligibility</h2>
            <p>
              You must be 18 years or older and legally permitted to work in Australia to create
              a Cuppa account. Businesses must hold a valid ABN. Baristas are engaged as
              independent contractors — Cuppa is not your employer.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">3. Platform Fee</h2>
            <p>
              Cuppa charges businesses a <strong>7% platform service fee</strong> on each shift.
              This fee is added on top of the barista&apos;s advertised hourly rate.
              Baristas receive 100% of their advertised rate — no deductions are made from worker
              earnings. The fee is displayed clearly before you publish a shift or accept an offer.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">4. Payments</h2>
            <p>
              Businesses are invoiced upon confirmation of worked hours. Invoices are due within
              48 hours. Disputed hours must be raised within 3 days. Cuppa may suspend accounts
              with outstanding invoices. Barista payouts are processed after business payment
              clears.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">5. Cancellations</h2>
            <p>
              Cancellations within 24 hours of the shift start time without a valid reason may
              result in account penalties including reduced Completion Rate score and, in repeat
              cases, suspension. See our{" "}
              <a href="/community-guidelines" className="text-brand hover:underline">
                Community Guidelines
              </a>{" "}
              for full cancellation policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">
              6. Intellectual Property
            </h2>
            <p>
              All content on Cuppa (logos, copy, code) is owned by Cuppa Platform Pty Ltd.
              You may not copy, reproduce, or distribute it without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>
              Cuppa is a marketplace facilitator. We are not responsible for the conduct,
              quality, or safety of any work performed. To the maximum extent permitted by law,
              our liability is limited to the fees paid to us in the 3 months prior to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">8. Contact</h2>
            <p>
              Questions about these Terms? Email us at{" "}
              <a href="mailto:hello@cuppa.com.au" className="text-brand hover:underline">
                hello@cuppa.com.au
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
