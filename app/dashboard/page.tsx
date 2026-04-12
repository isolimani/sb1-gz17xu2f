import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Smart redirect based on user role
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: userRow } = await supabase
    .from("users")
    .select("active_role, is_admin, has_worker_profile, has_business_profile")
    .eq("id", user.id)
    .single();

  if (!userRow) redirect("/auth/signup");

  if (userRow.is_admin) redirect("/admin/dashboard");
  if (userRow.active_role === "BUSINESS" && userRow.has_business_profile)
    redirect("/business/dashboard");
  if (userRow.has_worker_profile) redirect("/worker/dashboard");
  if (userRow.has_business_profile) redirect("/business/dashboard");

  // New user — pick onboarding
  redirect("/auth/signup");
}
