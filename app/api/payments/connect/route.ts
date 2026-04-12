import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// POST /api/payments/connect — create or retrieve Stripe Express account + onboarding link
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: worker } = await supabase
    .from("worker_profiles")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .single();

  if (!worker) {
    return NextResponse.json({ error: "Worker profile not found" }, { status: 404 });
  }

  let accountId = worker.stripe_account_id;

  // Create Express account if not yet created
  if (!accountId) {
    const { data: userRow } = await supabase
      .from("users")
      .select("email, name")
      .eq("id", user.id)
      .single();

    const account = await stripe.accounts.create({
      type: "express",
      country: "AU",
      email: userRow?.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        mcc: "7299", // services
        url: APP_URL,
      },
    });

    accountId = account.id;

    await supabase
      .from("worker_profiles")
      .update({ stripe_account_id: accountId })
      .eq("user_id", user.id);
  }

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${APP_URL}/worker/profile?section=payout&stripe=refresh`,
    return_url: `${APP_URL}/worker/profile?section=payout&stripe=complete`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url, accountId });
}

// GET /api/payments/connect — get account status
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: worker } = await supabase
    .from("worker_profiles")
    .select("stripe_account_id")
    .eq("user_id", user.id)
    .single();

  if (!worker?.stripe_account_id) {
    return NextResponse.json({ connected: false });
  }

  const account = await stripe.accounts.retrieve(worker.stripe_account_id);

  return NextResponse.json({
    connected: true,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  });
}
