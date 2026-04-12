"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { AU_STATES, type BusinessType } from "@/lib/types";

const BUSINESS_TYPES: { value: BusinessType; label: string; icon: string }[] =
  [
    { value: "CAFE", label: "Café", icon: "☕" },
    { value: "RESTAURANT", label: "Restaurant", icon: "🍽️" },
    { value: "HOTEL", label: "Hotel", icon: "🏨" },
    { value: "EVENT", label: "Events", icon: "🎪" },
    { value: "OTHER", label: "Other", icon: "🏢" },
  ];

export default function BusinessOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState("");
  const [abn, setAbn] = useState("");
  const [type, setType] = useState<BusinessType>("CAFE");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("VIC");
  const [postcode, setPostcode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase.from("business_profiles").insert({
      user_id: user.id,
      business_name: businessName,
      abn: abn || null,
      type,
      address,
      suburb,
      state,
      postcode,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await supabase
      .from("users")
      .update({ has_business_profile: true, active_role: "BUSINESS" })
      .eq("id", user.id);

    router.push("/business/dashboard");
  }

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-xl font-black text-foreground mb-1">
        Set up your business
      </h2>
      <p className="text-sm text-muted mb-6">
        You can post shifts as soon as your profile is complete
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Business name"
          placeholder="The Brew Co"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
        />

        <Input
          label="ABN (optional)"
          placeholder="12 345 678 901"
          value={abn}
          onChange={(e) => setAbn(e.target.value)}
        />

        {/* Business type */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Business type
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {BUSINESS_TYPES.map((bt) => (
              <button
                key={bt.value}
                type="button"
                onClick={() => setType(bt.value)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all",
                  type === bt.value
                    ? "border-brand bg-brand-light text-brand"
                    : "border-border text-muted hover:border-brand/40"
                )}
              >
                <span className="text-lg">{bt.icon}</span>
                {bt.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Street address"
          placeholder="82 Smith Street"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Suburb"
            placeholder="Fitzroy"
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
        </div>

        <Input
          label="Postcode"
          placeholder="3065"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          required
          maxLength={4}
        />

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create business profile →
        </Button>
      </form>
    </div>
  );
}
