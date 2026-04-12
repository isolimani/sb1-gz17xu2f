import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { format, parseISO, differenceInHours } from "date-fns";

interface Shift {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  suburb: string;
  state: string;
  required_skills: string[];
  status: string;
  business: { business_name: string; logo_url?: string; avg_rating?: number } | null;
}

export default function TempTab() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("shifts")
      .select(`
        id, title, start_time, end_time, hourly_rate,
        suburb, state, required_skills, status,
        business:business_profiles(business_name, logo_url, avg_rating)
      `)
      .eq("status", "OPEN")
      .eq("job_type", "TEMP")
      .gte("start_time", new Date().toISOString())
      .order("start_time")
      .limit(40);

    setShifts((data ?? []) as unknown as Shift[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color="#c5522a" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Casual shifts ☕</Text>
        <Text style={styles.subtitle}>{shifts.length} available near you</Text>
      </View>

      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c5522a" />
        }
        renderItem={({ item: shift }) => {
          const start = parseISO(shift.start_time);
          const end = parseISO(shift.end_time);
          const hours = differenceInHours(end, start);
          const estimatedPay = shift.hourly_rate * hours;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/shift/${shift.id}`)}
              activeOpacity={0.8}
            >
              {/* Business logo placeholder */}
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoEmoji}>☕</Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.bizName}>{shift.business?.business_name}</Text>
                <Text style={styles.location}>📍 {shift.suburb}</Text>
                <Text style={styles.time}>
                  {format(start, "EEE d MMM")} · {format(start, "h:mm a")}–{format(end, "h:mm a")}
                </Text>

                {/* Skills */}
                <View style={styles.skills}>
                  {shift.required_skills.slice(0, 3).map((skill) => (
                    <View key={skill} style={styles.skillPill}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                  {shift.required_skills.length > 3 && (
                    <View style={styles.skillPill}>
                      <Text style={styles.skillText}>+{shift.required_skills.length - 3}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.payRow}>
                  <Text style={styles.pay}>
                    ${shift.hourly_rate}/hr · {hours} hrs
                  </Text>
                  <Text style={styles.totalPay}>
                    ~${estimatedPay.toFixed(0)} total
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>☕</Text>
            <Text style={styles.emptyText}>No casual shifts right now — check back soon!</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafaf8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "900", color: "#1a1510" },
  subtitle: { fontSize: 13, color: "#9c8878", marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff3ec",
    borderWidth: 1,
    borderColor: "#f0cdb8",
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 22 },
  cardContent: { flex: 1, gap: 4 },
  bizName: { fontSize: 15, fontWeight: "700", color: "#1a1510" },
  location: { fontSize: 12, color: "#c5522a", fontWeight: "600" },
  time: { fontSize: 12, color: "#6b5a4e" },
  skills: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  skillPill: {
    backgroundColor: "#fafaf8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  skillText: { fontSize: 10, color: "#6b5a4e", fontWeight: "500" },
  payRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  pay: { fontSize: 12, color: "#6b5a4e" },
  totalPay: { fontSize: 15, fontWeight: "900", color: "#1a1510" },
  empty: { padding: 40, alignItems: "center", gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 14, color: "#9c8878", textAlign: "center" },
});
