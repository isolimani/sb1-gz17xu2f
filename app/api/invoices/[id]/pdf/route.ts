// Node.js runtime required — @react-pdf/renderer does not support Edge runtime
export const runtime = "nodejs";

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import { formatShortDate } from "@/lib/utils/date";
import { formatAUD } from "@/lib/utils/currency";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1510",
    padding: 48,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 36,
    paddingBottom: 24,
    borderBottom: "1px solid #e8e0d8",
  },
  brand: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#c5522a",
  },
  brandSub: {
    fontSize: 9,
    color: "#9c8878",
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1a1510",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 11,
    color: "#6b5a4e",
    textAlign: "right",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#9c8878",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottom: "1px solid #f0e8e0",
  },
  rowLabel: {
    color: "#6b5a4e",
  },
  rowValue: {
    fontFamily: "Helvetica-Bold",
    color: "#1a1510",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTop: "2px solid #1a1510",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1a1510",
  },
  totalValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#c5522a",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    textAlign: "center",
    fontSize: 8,
    color: "#9c8878",
  },
  metaGrid: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 24,
  },
  metaBlock: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#9c8878",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 11,
    color: "#1a1510",
    fontFamily: "Helvetica-Bold",
  },
  metaSub: {
    fontSize: 9,
    color: "#6b5a4e",
    marginTop: 1,
  },
});

interface InvoicePDFProps {
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  workerName: string;
  workerEmail: string;
  businessName: string;
  totalHours: number;
  hourlyRate: number;
  grossAmount: number;
  platformFeePct: number;
  platformFeeAmount: number;
  businessTotal: number;
}

function InvoicePDF({
  invoiceNumber,
  issuedDate,
  dueDate,
  workerName,
  workerEmail,
  businessName,
  totalHours,
  hourlyRate,
  grossAmount,
  platformFeePct,
  platformFeeAmount,
  businessTotal,
}: InvoicePDFProps) {
  return React.createElement(
    Document,
    { title: invoiceNumber },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.brand }, "Cuppa"),
          React.createElement(Text, { style: styles.brandSub }, "cuppa.com.au  ·  hello@cuppa.com.au")
        ),
        React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.invoiceTitle }, "INVOICE"),
          React.createElement(Text, { style: styles.invoiceNumber }, invoiceNumber)
        )
      ),
      // Dates
      React.createElement(
        View,
        { style: styles.metaGrid },
        React.createElement(
          View,
          { style: styles.metaBlock },
          React.createElement(Text, { style: styles.metaLabel }, "Issued"),
          React.createElement(Text, { style: styles.metaValue }, formatShortDate(issuedDate))
        ),
        React.createElement(
          View,
          { style: styles.metaBlock },
          React.createElement(Text, { style: styles.metaLabel }, "Due"),
          React.createElement(Text, { style: styles.metaValue }, formatShortDate(dueDate))
        ),
        React.createElement(
          View,
          { style: styles.metaBlock },
          React.createElement(Text, { style: styles.metaLabel }, "Bill to"),
          React.createElement(Text, { style: styles.metaValue }, businessName)
        ),
        React.createElement(
          View,
          { style: styles.metaBlock },
          React.createElement(Text, { style: styles.metaLabel }, "Barista"),
          React.createElement(Text, { style: styles.metaValue }, workerName),
          React.createElement(Text, { style: styles.metaSub }, workerEmail)
        )
      ),
      // Line items
      React.createElement(
        View,
        { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, "Services"),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.rowLabel }, "Barista services"),
            React.createElement(
              Text,
              { style: { fontSize: 8, color: "#9c8878", marginTop: 2 } },
              `${totalHours.toFixed(1)} hrs × ${formatAUD(hourlyRate)}/hr`
            )
          ),
          React.createElement(Text, { style: styles.rowValue }, formatAUD(grossAmount))
        ),
        React.createElement(
          View,
          { style: styles.row },
          React.createElement(
            View,
            null,
            React.createElement(Text, { style: styles.rowLabel }, "Platform service fee"),
            React.createElement(
              Text,
              { style: { fontSize: 8, color: "#9c8878", marginTop: 2 } },
              `${platformFeePct}% of barista rate — charged to business only`
            )
          ),
          React.createElement(Text, { style: styles.rowValue }, formatAUD(platformFeeAmount))
        ),
        React.createElement(
          View,
          { style: styles.totalRow },
          React.createElement(Text, { style: styles.totalLabel }, "TOTAL DUE (AUD)"),
          React.createElement(Text, { style: styles.totalValue }, formatAUD(businessTotal))
        )
      ),
      // Footer
      React.createElement(
        Text,
        { style: styles.footer },
        `Cuppa Platform Pty Ltd  ·  Invoice ${invoiceNumber}  ·  Payment due ${formatShortDate(dueDate)}`
      )
    )
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      transaction:transactions(total_hours, hourly_rate, gross_amount, platform_fee_pct, platform_fee_amount, business_total),
      worker:users!worker_id(name, email),
      business:business_profiles(business_name)
    `)
    .eq("id", id)
    .or(`business_id.eq.${user.id},worker_id.eq.${user.id}`)
    .single();

  if (!invoice) return new Response("Not found", { status: 404 });

  const txn = invoice.transaction as {
    total_hours: number;
    hourly_rate: number;
    gross_amount: number;
    platform_fee_pct: number;
    platform_fee_amount: number;
    business_total: number;
  } | null;

  const worker = invoice.worker as { name: string; email: string } | null;
  const biz = invoice.business as { business_name: string } | null;

  const pdfBuffer = await renderToBuffer(
    React.createElement(InvoicePDF, {
      invoiceNumber: invoice.invoice_number,
      issuedDate: invoice.issued_date,
      dueDate: invoice.due_date,
      workerName: worker?.name ?? "Barista",
      workerEmail: worker?.email ?? "",
      businessName: biz?.business_name ?? "Business",
      totalHours: txn?.total_hours ?? 0,
      hourlyRate: txn?.hourly_rate ?? 0,
      grossAmount: txn?.gross_amount ?? invoice.total_amount,
      platformFeePct: txn?.platform_fee_pct ?? 7,
      platformFeeAmount: txn?.platform_fee_amount ?? 0,
      businessTotal: txn?.business_total ?? invoice.total_amount,
    })
  );

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
