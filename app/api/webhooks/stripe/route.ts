export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const transactionId = pi.metadata?.transaction_id;
      if (!transactionId) break;

      await supabase
        .from("transactions")
        .update({
          status: "COMPLETED",
          stripe_payment_intent_id: pi.id,
          stripe_transfer_id: pi.transfer_data?.destination as string | undefined,
        })
        .eq("id", transactionId);

      // Also mark invoice as paid
      const { data: txn } = await supabase
        .from("transactions")
        .select("id")
        .eq("id", transactionId)
        .single();

      if (txn) {
        await supabase
          .from("invoices")
          .update({ status: "PAID", paid_at: new Date().toISOString() })
          .eq("transaction_id", transactionId);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const transactionId = pi.metadata?.transaction_id;
      if (!transactionId) break;

      await supabase
        .from("transactions")
        .update({ status: "FAILED" })
        .eq("id", transactionId);
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      if (account.charges_enabled && account.payouts_enabled) {
        // Mark worker as having a fully connected account
        await supabase
          .from("worker_profiles")
          .update({ stripe_account_id: account.id })
          .eq("stripe_account_id", account.id);
      }
      break;
    }

    default:
      // Unhandled event type — log and return 200
      console.log(`Unhandled Stripe webhook event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
