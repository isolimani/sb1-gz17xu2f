"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { BARISTA_SKILLS, CERTIFICATIONS, AU_STATES } from "@/lib/types";

const STEPS = ["Profile", "Skills", "Rate & Location", "Done"];

export default function WorkerOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [bio, setBio] = useState("");
  const [yearsExp, setYearsExp] = useState("1");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("38");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("VIC");

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function toggleCert(cert: string) {
    setSelectedCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase.from("worker_profiles").insert({
      user_id: user.id,
      bio,
      years_experience: parseInt(yearsExp),
      skills: selectedSkills,
      certifications: selectedCerts,
      hourly_rate_min: parseFloat(hourlyRate),
      suburb,
      state,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Update user record
    await supabase
      .from("users")
      .update({ has_worker_profile: true, active_role: "WORKER" })
      .eq("id", user.id);

    setStep(3);
    setLoading(false);
  }

  if (step === 3) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="text-6xl mb-5">🎉</div>
        <h2 className="text-2xl font-black text-foreground mb-3">
          You&apos;re all set!
        </h2>
        <p className="text-muted text-sm mb-8">
          Your profile is under review. You&apos;ll be notified once approved
          and can start browsing shifts.
        </p>
        <Button fullWidth size="lg" onClick={() => router.push("/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {STEPS.slice(0, 3).map((s, i) => (
            <span
              key={s}
              className={cn(
                "text-xs font-medium",
                i === step ? "text-brand" : i < step ? "text-success" : "text-muted"
              )}
            >
              {i < step ? "✓ " : ""}{s}
            </span>
          ))}
        </div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 0: Profile */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-foreground mb-1">
              Tell us about yourself
            </h2>
            <p className="text-sm text-muted">
              Businesses read your profile before booking you
            </p>
          </div>
          <Textarea
            label="Bio"
            placeholder="e.g. 4 years specialty coffee experience. Former head barista at Brother Baba Budan. Love latte art and high-volume service."
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Years of experience
            </label>
            <select
              value={yearsExp}
              onChange={(e) => setYearsExp(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {["<1", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map(
                (v) => (
                  <option key={v} value={v}>
                    {v} {v === "<1" ? "year" : v === "1" ? "year" : "years"}
                  </option>
                )
              )}
            </select>
          </div>
          <Button fullWidth size="lg" onClick={() => setStep(1)}>
            Next →
          </Button>
        </div>
      )}

      {/* Step 1: Skills */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-foreground mb-1">
              Your skills
            </h2>
            <p className="text-sm text-muted">
              Select all that apply — this helps businesses find you
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Barista skills
            </p>
            <div className="flex flex-wrap gap-2">
              {BARISTA_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                    selectedSkills.includes(skill)
                      ? "bg-brand border-brand text-white"
                      : "border-border text-muted hover:border-brand/40"
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Certifications
            </p>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATIONS.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => toggleCert(cert)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                    selectedCerts.includes(cert)
                      ? "bg-brand border-brand text-white"
                      : "border-border text-muted hover:border-brand/40"
                  )}
                >
                  {cert}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>
              ← Back
            </Button>
            <Button fullWidth size="lg" onClick={() => setStep(2)}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Rate & Location */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-black text-foreground mb-1">
              Rate & location
            </h2>
            <p className="text-sm text-muted">
              Businesses will see your rate when searching
            </p>
          </div>

          <Input
            label="Minimum hourly rate (AUD)"
            type="number"
            min="25"
            max="120"
            step="0.5"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            leftIcon={<span className="text-sm font-semibold">$</span>}
            hint="Australian minimum wage is ~$24.10/hr. Most baristas charge $35–$55."
          />

          <Input
            label="Suburb"
            placeholder="e.g. Fitzroy"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            required
          />

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {AU_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs text-error bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button
              fullWidth
              size="lg"
              loading={loading}
              onClick={handleSubmit}
            >
              Complete profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
