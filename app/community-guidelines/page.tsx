import { TopNav, Footer } from "@/components/layout/TopNav";

export const metadata = { title: "Community Guidelines — Cuppa" };

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full">
        <h1 className="text-3xl font-black text-foreground mb-2">
          Community Guidelines
        </h1>
        <p className="text-muted mb-10">
          For Cuppa to work, everyone must act in a considerate and organised manner.
        </p>

        <div className="space-y-10 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-base font-bold text-foreground mb-3">
              For Baristas
            </h2>
            <ul className="space-y-2 list-none">
              {[
                "Only apply for shifts you genuinely intend to work.",
                "Arrive at least 10 minutes before your scheduled start time.",
                "Notify the business immediately if you are running late or cannot make it.",
                "Set a calendar reminder and plan your travel route in advance.",
                "Bring any equipment specified on the shift posting.",
                "Clarify expectations with the business if the shift details are unclear.",
                "After the shift, text or email the business your time worked to help them process payment correctly.",
                "Maintain a professional attitude and dress appropriately for the venue.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-brand mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">
              For Businesses
            </h2>
            <ul className="space-y-2 list-none">
              {[
                "Post accurate shift details — location, hours, rate, equipment, and expectations.",
                "Respond to applications within 24 hours where possible.",
                "Notify accepted baristas of any last-minute changes as soon as possible.",
                "Pay invoices within 48 hours of shift completion.",
                "Treat baristas respectfully — they are skilled professionals.",
                "Leave an honest review after each shift to help the community thrive.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-brand mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">
              Work Cancellations
            </h2>
            <p className="mb-3">
              Individuals or businesses will sometimes need to cancel a job, so we encourage
              people to cancel with as much notice as possible. To cancel a job, notify the
              other party and action it in the app.
            </p>
            <p className="mb-3">
              Please be mindful that any cancellation will be reflected in your Completion Rate.
              Cancelling a job without a valid reason within{" "}
              <strong>24 hours from the start time</strong> may result in a suspension from Cuppa.
            </p>
            <p>
              For this community to thrive, everyone must act in a considerate and organised manner.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">Payments</h2>
            <p className="mb-3">
              Payment should be made within <strong>48 hours</strong> from completion of the work.
              If there&apos;s an issue with payment, the barista should contact the business directly.
              Any mistake should be resolved no later than 3 days after the issue is brought to the
              business&apos; attention.
            </p>
            <p>
              If there is a dispute over payment, please contact Cuppa at{" "}
              <a href="mailto:hello@cuppa.com.au" className="text-brand hover:underline">
                hello@cuppa.com.au
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-foreground mb-3">
              Prohibited Behaviour
            </h2>
            <ul className="space-y-2 list-none">
              {[
                "Harassment or discrimination of any kind.",
                "Misrepresenting your skills or experience.",
                "Arranging off-platform payments to avoid Cuppa fees.",
                "Leaving false reviews.",
                "Creating multiple accounts.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-error mt-0.5">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className="text-muted">
              Violations of these guidelines may result in account suspension or permanent removal
              from the platform. If you have concerns about another user&apos;s behaviour, please
              report it to{" "}
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
