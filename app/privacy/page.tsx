import { TopNav, Footer } from "@/components/layout/TopNav";

export const metadata = { title: "Privacy Policy — Cuppa" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <h1 className="text-3xl font-black text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-base font-bold text-foreground mb-3">
              Information We Collect
            </h2>
            <ul className="space-y-1 list-disc list-inside">
              <li>Account information: name, email, phone number, profile photo</li>
              <li>Professional details: work history, skills, certifications (baristas)</li>
              <li>Business details: ABN, address, business type (businesses)</li>
              <li>Location data: suburb, state, and optional GPS on clock-in/out</li>
              <li>Financial information: processed securely via Stripe — we do not store card numbers</li>
              <li>Usage data: shifts browsed, applications submitted, ratings given</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">How We Use It</h2>
            <ul className="space-y-1 list-disc list-inside">
              <li>Matching baristas with suitable shifts</li>
              <li>Processing payments and generating invoices</li>
              <li>Sending booking confirmations and shift reminders</li>
              <li>Verifying barista profiles (vetting process)</li>
              <li>Improving the platform via aggregated analytics</li>
              <li>Preventing fraud and enforcing our Terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">Data Sharing</h2>
            <p className="mb-3">
              We share your information only as needed to provide the service:
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                <strong>Stripe</strong> — payment processing (subject to Stripe&apos;s Privacy Policy)
              </li>
              <li>
                <strong>Resend</strong> — transactional email delivery
              </li>
              <li>
                <strong>Supabase</strong> — hosted database and authentication infrastructure
              </li>
              <li>Other businesses or baristas as required for a confirmed booking</li>
            </ul>
            <p className="mt-3">
              We never sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. You may request
              deletion at any time — see Your Rights below. Financial records may be retained
              for 7 years as required by Australian tax law.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">Your Rights</h2>
            <p>
              Under the Australian Privacy Act 1988, you have the right to access, correct,
              or delete your personal information. To exercise these rights, email{" "}
              <a href="mailto:hello@cuppa.com.au" className="text-brand hover:underline">
                hello@cuppa.com.au
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">Cookies</h2>
            <p>
              We use cookies solely to maintain your authenticated session. We do not use
              advertising trackers or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">Contact</h2>
            <p>
              Privacy questions? Contact our Privacy Officer at{" "}
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
