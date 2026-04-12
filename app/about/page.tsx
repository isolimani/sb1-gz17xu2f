import { TopNav, Footer } from "@/components/layout/TopNav";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "About — Cuppa" };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <p className="text-brand font-semibold text-sm mb-3">Our story</p>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-6 leading-tight">
            Built for baristas.<br />
            Priced fairly.
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Cuppa was created because we thought the existing platforms were charging too much —
            especially from the workers who could least afford it. Baristas deserve to keep
            every dollar they earn.
          </p>
        </section>

        {/* Fee comparison */}
        <section className="bg-surface border-y border-border py-16">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-black text-foreground text-center mb-10">
              We&apos;re the lowest-fee platform in Australia
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { platform: "Others", fee: "10–25%", who: "often from workers", color: "text-error" },
                { platform: "Cuppa", fee: "7%", who: "businesses only", color: "text-success" },
                { platform: "Worker keeps", fee: "100%", who: "of their rate", color: "text-brand" },
              ].map((item) => (
                <div key={item.platform} className="bg-background rounded-2xl border border-border p-5">
                  <p className="text-xs text-muted mb-2">{item.platform}</p>
                  <p className={`text-3xl font-black ${item.color}`}>{item.fee}</p>
                  <p className="text-xs text-muted mt-1">{item.who}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <h2 className="text-2xl font-black text-foreground text-center mb-12">
            What we believe
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "☕",
                title: "Baristas first",
                desc: "Skilled coffee professionals deserve a platform that respects their work. Zero fees taken from workers — ever.",
              },
              {
                icon: "⚡",
                title: "Fast & simple",
                desc: "Post a shift in under 2 minutes. Apply with one tap. No lengthy forms, no unnecessary friction.",
              },
              {
                icon: "🤝",
                title: "Trust through community",
                desc: "Verified profiles, transparent ratings, and a karma system that rewards reliability from both sides.",
              },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <p className="text-4xl mb-4">{v.icon}</p>
                <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-black text-white mb-4">
              Ready to join?
            </h2>
            <p className="text-white/80 mb-8">
              Whether you&apos;re a barista looking for flexible work or a café needing
              reliable cover — Cuppa is for you.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/auth/signup">
                <Button className="bg-white text-brand hover:bg-white/90 font-bold">
                  Join as a barista
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  Post a shift
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
