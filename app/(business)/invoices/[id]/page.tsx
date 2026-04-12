import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatAUD } from "@/lib/utils/currency";
import { formatShortDate, formatFullDate } from "@/lib/utils/date";

export const metadata = { title: "Invoice" };

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      worker:users!worker_id(name, email),
      transaction:transactions(
        total_hours, hourly_rate, gross_amount,
        platform_fee_pct, platform_fee_amount, business_total,
        payment_method, status, payout_date
      )
    `)
    .eq("id", id)
    .eq("business_id", user.id)
    .single();

  if (!invoice) notFound();

  const txn = invoice.transaction as {
    total_hours: number;
    hourly_rate: number;
    gross_amount: number;
    platform_fee_pct: number;
    platform_fee_amount: number;
    business_total: number;
    payment_method: string;
    status: string;
    payout_date?: string;
  } | null;

  const worker = invoice.worker as { name: string; email: string } | null;

  const isOverdue =
    invoice.status === "OVERDUE" ||
    (invoice.status === "SENT" && new Date(invoice.due_date) < new Date());

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/business/invoices"
            className="text-xs text-muted hover:text-brand transition-colors"
          >
            ← Back to invoices
          </Link>
          <h1 className="text-2xl font-black text-foreground mt-1">
            {invoice.invoice_number}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={invoice.status} />
          {invoice.pdf_url && (
            <a
              href={`/api/invoices/${id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                Download PDF
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Overdue warning */}
      {isOverdue && (
        <div className="bg-error/5 border border-error/20 rounded-2xl p-4">
          <p className="text-sm font-semibold text-error">
            This invoice is overdue
          </p>
          <p className="text-xs text-muted mt-0.5">
            Payment was due {formatShortDate(invoice.due_date)}.
            Please pay immediately to avoid disruption to your account.
          </p>
        </div>
      )}

      {/* Invoice card */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {/* From / To */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <div className="p-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              From
            </p>
            <p className="text-sm font-bold text-foreground">Cuppa Platform</p>
            <p className="text-xs text-muted mt-1">hello@cuppa.com.au</p>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Barista
            </p>
            <p className="text-sm font-bold text-foreground">{worker?.name}</p>
            {worker?.email && (
              <p className="text-xs text-muted mt-1">{worker.email}</p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <div className="p-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
              Issued
            </p>
            <p className="text-sm text-foreground">
              {formatShortDate(invoice.issued_date)}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">
              Due
            </p>
            <p
              className={`text-sm font-semibold ${
                isOverdue ? "text-error" : "text-foreground"
              }`}
            >
              {formatShortDate(invoice.due_date)}
            </p>
          </div>
        </div>

        {/* Line items */}
        <div className="p-5 space-y-3">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Line items
          </p>

          {txn ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <p className="text-foreground">
                  Barista services
                  <span className="text-muted ml-1 text-xs">
                    ({txn.total_hours.toFixed(1)} hrs × {formatAUD(txn.hourly_rate)}/hr)
                  </span>
                </p>
                <p className="font-semibold text-foreground">
                  {formatAUD(txn.gross_amount)}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <p className="text-foreground">
                  Platform service fee
                  <span className="text-muted ml-1 text-xs">({txn.platform_fee_pct}%)</span>
                </p>
                <p className="font-semibold text-foreground">
                  {formatAUD(txn.platform_fee_amount)}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <p className="font-bold text-foreground">Total due (AUD)</p>
                <p className="text-xl font-black text-foreground">
                  {formatAUD(txn.business_total)}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">Total</p>
              <p className="text-xl font-black text-foreground">
                {formatAUD(invoice.total_amount)}
              </p>
            </div>
          )}
        </div>

        {/* Payment status */}
        {invoice.status === "PAID" && (
          <div className="mx-5 mb-5 bg-success/5 border border-success/20 rounded-xl p-3 flex items-center gap-2">
            <span className="text-success">✓</span>
            <p className="text-sm text-success font-medium">
              Paid{invoice.paid_at ? ` on ${formatShortDate(invoice.paid_at)}` : ""}
            </p>
          </div>
        )}
      </div>

      {/* Pay Now (manual) */}
      {["SENT", "OVERDUE"].includes(invoice.status) && (
        <div className="bg-surface rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-1">Pay this invoice</h2>
          <p className="text-xs text-muted mb-4">
            Transfer {formatAUD(invoice.total_amount)} to the account below using
            reference <span className="font-mono font-semibold">{invoice.invoice_number}</span>.
            Payment must be received within 48 hours of the shift completing.
          </p>
          <div className="bg-background rounded-xl border border-border p-4 text-sm space-y-1 font-mono mb-4">
            <p><span className="text-muted">Account name: </span>Cuppa Platform Pty Ltd</p>
            <p><span className="text-muted">BSB: </span>083-004</p>
            <p><span className="text-muted">Account: </span>12345678</p>
            <p><span className="text-muted">Reference: </span>{invoice.invoice_number}</p>
          </div>
          <p className="text-xs text-muted">
            Having trouble?{" "}
            <a href="mailto:hello@cuppa.com.au" className="text-brand hover:underline">
              Contact us
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
