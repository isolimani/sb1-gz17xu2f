import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/ui/Badge";
import { formatAUD } from "@/lib/utils/currency";
import { formatShortDate } from "@/lib/utils/date";
import Link from "next/link";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      *,
      worker:users!worker_id(name)
    `)
    .eq("business_id", user.id)
    .order("created_at", { ascending: false });

  const total = (invoices ?? []).reduce((s, i) => s + i.total_amount, 0);
  const outstanding = (invoices ?? [])
    .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
    .reduce((s, i) => s + i.total_amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-foreground">Invoices</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total invoiced", value: formatAUD(total) },
          { label: "Outstanding", value: formatAUD(outstanding), highlight: outstanding > 0 },
          { label: "Invoices", value: invoices?.length ?? 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-4 ${
              stat.highlight
                ? "border-error/30 bg-red-50"
                : "border-border bg-surface"
            }`}
          >
            <p className="text-xs text-muted uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p
              className={`text-xl font-black ${
                stat.highlight ? "text-error" : "text-foreground"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Invoice table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">All invoices</h2>
        </div>

        {!invoices || invoices.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-muted text-sm">
              Invoices are generated automatically when you confirm a barista&apos;s hours.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-background/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {inv.invoice_number}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {(inv.worker as { name: string } | null)?.name} ·{" "}
                    Issued {formatShortDate(inv.issued_date)} ·{" "}
                    Due {formatShortDate(inv.due_date)}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <StatusBadge status={inv.status} />
                  <p className="text-sm font-bold text-foreground w-20 text-right">
                    {formatAUD(inv.total_amount)}
                  </p>
                  <Link
                    href={`/business/invoices/${inv.id}`}
                    className="text-xs text-brand hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
