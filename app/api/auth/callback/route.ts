import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user has a profile; if not, redirect to onboarding
      const { data: user } = await supabase
        .from("users")
        .select("has_worker_profile, has_business_profile")
        .eq("id", data.user.id)
        .single();

      if (!user?.has_worker_profile && !user?.has_business_profile) {
        return NextResponse.redirect(`${origin}/auth/onboarding/worker`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_error`);
}
