import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { format, parseISO, startOfMonth, startOfWeek, startOfYear, subMonths, getMonth } from "date-fns";

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  status: string;
  issued_date: string;
  created_at: string;
  business: { business_name: string } | null;
  transaction: { gross_amount: number; total_hours: number; hourly_rate: number } | null;
}

const PERIODS = ["Week", "Month", "Year"] as const;

export default function EarningsTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Month");

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("invoices")
      .select(`
        id, invoice_number, total_amount, status, issued_date, created_at,
        business:business_profiles(business_name),
        transaction:transactions(gross_amount, total_hours, hourly_rate)
      `)
      .eq("worker_id", user.id)
      .order("created_at", { ascending: false });
    setInvoices((data ?? []) as unknown as Invoice[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const now = new Date();
  let periodStart: Date;
  if (period === "Week") periodStart = startOfWeek(now, { weekStartsOn: 1 });
  else if (period === "Year") periodStart = startOfYear(now);
  else periodStart = startOfMonth(now);

  const periodInvoices = invoices.filter((inv) => new Date(inv.created_at) >= periodStart);
  const totalEarned = periodInvoices.reduce((s, inv) => s + (inv.transaction?.gross_amount ?? inv.total_amount), 0);
  const totalShifts = periodInvoices.length;
  const totalHours = periodInvoices.reduce((s, inv) => s + (inv.transaction?.total_hours ?? 0), 0);

  // Monthly bar chart — last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    const amt = invoices
      .filter((inv) => {
        const invDate = parseISO(inv.created_at);
        return getMonth(invDate) === getMonth(d) && invDate.getFullYear() === d.getFullYear();
      })
      .reduce((s, inv) => s + (inv.transaction?.gross_amount ?? inv.total_amount), 0);
    return { label: format(d, "MMM"), amt };
  });
  const maxAmt = Math.max(...months.map((m) => m.amt), 1);

  const statusColor: Record<string, string> = {
    PAID: "#2a9d5c",
    SENT: "#c5522a",
    OVERDUE: "#dc2626",
    DRAFT: "#9c8878",
  };
  const statusLabel: Record<string, string> = {
    PAID: "Paid",
    SENT: "Pending",
    OVERDUE: "Overdue",
    DRAFT: "Draft",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c5522a" />}
      >
        <Text style={styles.title}>Earnings</Text>

        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Earned", value: `$${totalEarned.toFixed(0)}` },
            { label: "Shifts", value: String(totalShifts) },
            { label: "Hours", value: totalHours.toFixed(1) },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Bar chart */}
        <View style={styles.chart}>
          <Text style={styles.chartTitle}>Monthly earnings</Text>
          <View style={styles.bars}>
            {months.map((m) => (
              <View key={m.label} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max((m.amt / maxAmt) * 100, m.amt > 0 ? 4 : 1)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Invoice list */}
        <Text style={styles.listTitle}>Payment history</Text>
        {invoices.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🧾</Text>
            <Text style={styles.emptyText}>Your earnings will appear here after completing shifts.</Text>
          </View>
        ) : (
          <View style={styles.invoiceList}>
            {invoices.map((inv) => (
              <View key={inv.id} style={styles.invoiceRow}>
                <View style={styles.invoiceLeft}>
                  <View style={styles.invoiceIcon}>
                    <Text style={{ fontSize: 16 }}>☕</Text>
                  </View>
                  <View>
                    <Text style={styles.invoiceBiz}>{inv.business?.business_name ?? "Business"}</Text>
                    <Text style={styles.invoiceDate}>
                      {format(parseISO(inv.issued_date), "d MMM yyyy")}
                      {inv.transaction && ` · ${inv.transaction.total_hours.toFixed(1)} hrs`}
                    </Text>
                  </View>
                </View>
                <View style={styles.invoiceRight}>
                  <Text style={[styles.invoiceStatus, { color: statusColor[inv.status] ?? "#9c8878" }]}>
                    {statusLabel[inv.status] ?? inv.status}
                  </Text>
                  <Text style={styles.invoiceAmt}>
                    ${(inv.transaction?.gross_amount ?? inv.total_amount).toFixed(0)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafaf8" },
  scroll: { padding: 20, gap: 20 },
  title: { fontSize: 24, fontWeight: "900", color: "#1a1510" },
  periodRow: {
    flexDirection: "row",
    backgroundColor: "#f0e8e0",
    borderRadius: 12,
    padding: 4,
  },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  periodBtnActive: { backgroundColor: "#ffffff" },
  periodText: { fontSize: 13, color: "#9c8878", fontWeight: "600" },
  periodTextActive: { color: "#1a1510" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: "900", color: "#1a1510" },
  statLabel: { fontSize: 11, color: "#9c8878" },
  chart: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    padding: 16,
    gap: 12,
  },
  chartTitle: { fontSize: 13, fontWeight: "700", color: "#9c8878", textTransform: "uppercase", letterSpacing: 0.5 },
  bars: { flexDirection: "row", alignItems: "flex-end", height: 80, gap: 6 },
  barCol: { flex: 1, alignItems: "center", gap: 4 },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", backgroundColor: "#c5522a", borderRadius: 4, minHeight: 2 },
  barLabel: { fontSize: 9, color: "#9c8878", fontWeight: "600" },
  listTitle: { fontSize: 16, fontWeight: "700", color: "#1a1510" },
  invoiceList: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    overflow: "hidden",
  },
  invoiceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0e8e0",
  },
  invoiceLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  invoiceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff3ec",
    alignItems: "center",
    justifyContent: "center",
  },
  invoiceBiz: { fontSize: 13, fontWeight: "600", color: "#1a1510" },
  invoiceDate: { fontSize: 11, color: "#9c8878", marginTop: 1 },
  invoiceRight: { alignItems: "flex-end", gap: 2 },
  invoiceStatus: { fontSize: 11, fontWeight: "600" },
  invoiceAmt: { fontSize: 15, fontWeight: "900", color: "#1a1510" },
  empty: { padding: 32, alignItems: "center", gap: 12 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 13, color: "#9c8878", textAlign: "center" },
});
