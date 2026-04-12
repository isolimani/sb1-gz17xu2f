import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { format, parseISO, differenceInHours } from "date-fns";

interface UpcomingShift {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  suburb: string;
  business: { business_name: string } | null;
}

interface PendingApp {
  id: string;
  status: string;
  shift: { title: string; start_time: string; suburb: string } | null;
}

export default function HomeTab() {
  const { userRow, worker } = useAuthStore();
  const [upcomingShifts, setUpcomingShifts] = useState<UpcomingShift[]>([]);
  const [pendingApps, setPendingApps] = useState<PendingApp[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = userRow?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: shifts }, { data: apps }] = await Promise.all([
      supabase
        .from("shifts")
        .select("*, business:business_profiles(business_name)")
        .eq("filled_by_worker_id", user.id)
        .in("status", ["FILLED", "IN_PROGRESS"])
        .gte("start_time", new Date().toISOString())
        .order("start_time")
        .limit(3),
      supabase
        .from("applications")
        .select("id, status, shift:shifts(title, start_time, suburb)")
        .eq("worker_id", user.id)
        .in("status", ["PENDING", "OFFERED"])
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    setUpcomingShifts((shifts ?? []) as unknown as UpcomingShift[]);
    setPendingApps((apps ?? []) as unknown as PendingApp[]);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const offers = pendingApps.filter((a) => a.status === "OFFERED");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c5522a" />}
      >
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}, {firstName} ☕</Text>
          <Text style={styles.subtext}>
            {worker?.vetting_status === "APPROVED"
              ? "Ready for your next shift"
              : "Profile under review"}
          </Text>
        </View>

        {/* Vetting pending banner */}
        {worker?.vetting_status === "PENDING" && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              ⏳ Your profile is under review. We'll notify you once approved.
            </Text>
          </View>
        )}

        {/* Offers */}
        {offers.length > 0 && (
          <View style={styles.offerCard}>
            <Text style={styles.offerTitle}>🎉 You have {offers.length} job offer{offers.length > 1 ? "s" : ""}!</Text>
            {offers.map((app) => (
              <TouchableOpacity
                key={app.id}
                style={styles.offerRow}
                onPress={() => router.push(`/(tabs)/temp`)}
              >
                <Text style={styles.offerShift}>{app.shift?.title}</Text>
                <Text style={styles.offerCta}>Review →</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming shifts */}
        {upcomingShifts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your upcoming shifts</Text>
            {upcomingShifts.map((shift) => {
              const start = parseISO(shift.start_time);
              const hoursUntil = differenceInHours(start, new Date());
              return (
                <TouchableOpacity
                  key={shift.id}
                  style={styles.shiftCard}
                  onPress={() => router.push(`/shift/${shift.id}`)}
                >
                  <View style={styles.shiftDateChip}>
                    <Text style={styles.chipDay}>{format(start, "EEE").toUpperCase()}</Text>
                    <Text style={styles.chipDate}>{format(start, "d")}</Text>
                    <Text style={styles.chipMonth}>{format(start, "MMM").toUpperCase()}</Text>
                  </View>
                  <View style={styles.shiftInfo}>
                    <Text style={styles.shiftBiz}>{shift.business?.business_name}</Text>
                    <Text style={styles.shiftTime}>{format(start, "h:mm a")} · {shift.suburb}</Text>
                    <Text style={styles.shiftRate}>${shift.hourly_rate}/hr</Text>
                  </View>
                  {hoursUntil < 24 && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>Soon</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Quick nav */}
        <View style={styles.quickNav}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push("/(tabs)/temp")}>
            <Text style={styles.quickEmoji}>☕</Text>
            <Text style={styles.quickLabel}>Find shifts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push("/(tabs)/earnings")}>
            <Text style={styles.quickEmoji}>💰</Text>
            <Text style={styles.quickLabel}>Earnings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push("/(tabs)/more")}>
            <Text style={styles.quickEmoji}>👤</Text>
            <Text style={styles.quickLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafaf8" },
  scroll: { padding: 20, gap: 20 },
  header: { gap: 4 },
  greeting: { fontSize: 24, fontWeight: "900", color: "#1a1510" },
  subtext: { fontSize: 13, color: "#9c8878" },
  banner: {
    backgroundColor: "#fef3cd",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f0d58c",
  },
  bannerText: { fontSize: 13, color: "#856404", fontWeight: "500" },
  offerCard: {
    backgroundColor: "#fff3ec",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f0cdb8",
    gap: 10,
  },
  offerTitle: { fontSize: 14, fontWeight: "700", color: "#c5522a" },
  offerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  offerShift: { fontSize: 14, color: "#1a1510", flex: 1 },
  offerCta: { fontSize: 13, color: "#c5522a", fontWeight: "600" },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1a1510" },
  shiftCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  shiftDateChip: {
    width: 44,
    alignItems: "center",
    backgroundColor: "#fafaf8",
    borderRadius: 10,
    padding: 6,
  },
  chipDay: { fontSize: 9, fontWeight: "700", color: "#9c8878" },
  chipDate: { fontSize: 20, fontWeight: "900", color: "#1a1510", lineHeight: 24 },
  chipMonth: { fontSize: 9, fontWeight: "700", color: "#9c8878" },
  shiftInfo: { flex: 1, gap: 2 },
  shiftBiz: { fontSize: 14, fontWeight: "700", color: "#1a1510" },
  shiftTime: { fontSize: 12, color: "#6b5a4e" },
  shiftRate: { fontSize: 12, color: "#c5522a", fontWeight: "600" },
  urgentBadge: {
    backgroundColor: "#fff3ec",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#f0cdb8",
  },
  urgentText: { fontSize: 10, color: "#c5522a", fontWeight: "700" },
  quickNav: {
    flexDirection: "row",
    gap: 12,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  quickEmoji: { fontSize: 24 },
  quickLabel: { fontSize: 12, color: "#6b5a4e", fontWeight: "600" },
});
