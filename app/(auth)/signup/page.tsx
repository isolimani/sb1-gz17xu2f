"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

type Role = "worker" | "business";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as Role) ?? "worker";

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: role === "worker" ? "WORKER" : "BUSINESS",
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push(
        role === "worker"
          ? "/auth/onboarding/worker"
          : "/auth/onboarding/business"
      );
    }
  }

  return (
    <Card className="w-full max-w-sm" padding="lg">
      <h1 className="text-2xl font-black text-foreground mb-1">Join Cuppa</h1>
      <p className="text-sm text-muted mb-5">Create your free account</p>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {(
          [
            { value: "worker", label: "I'm a barista", icon: "☕" },
            { value: "business", label: "I hire baristas", icon: "🏪" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRole(option.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all",
              role === option.value
                ? "border-brand bg-brand-light text-brand"
                : "border-border text-muted hover:border-brand/40"
            )}
          >
            <span className="text-xl">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Sam Torres"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="8+ characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth loading={loading} size="lg">
          Create account
        </Button>
      </form>

      <p className="text-center text-xs text-muted mt-4 leading-relaxed">
        By signing up you agree to our{" "}
        <Link href="/terms" className="text-brand hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-brand hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="text-center text-sm text-muted mt-4">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-brand font-semibold hover:underline"
        >
          Log in
        </Link>
      </p>
    </Card>
  );
}
