import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const PatchSchema = z.object({
  status: z.enum(["PAID", "OVERDUE"]),
  paid_at: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`
      *,
      transaction:transactions(*),
      worker:users!worker_id(name, email),
      business:business_profiles(business_name, logo_url, address, suburb, state)
    `)
    .eq("id", id)
    .or(`business_id.eq.${user.id},worker_id.eq.${user.id}`)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(invoice);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Only business or admin can update invoice status
  const { data: invoice } = await supabase
    .from("invoices")
    .select("business_id")
    .eq("id", id)
    .single();

  if (!invoice || invoice.business_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "PAID") {
    updates.paid_at = parsed.data.paid_at ?? new Date().toISOString();
  }

  const { data: updated, error } = await supabase
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(updated);
}
