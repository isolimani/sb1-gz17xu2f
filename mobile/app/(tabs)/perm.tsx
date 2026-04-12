import { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

interface PermJob {
  id: string;
  title: string;
  description?: string;
  hourly_rate: number;
  weekly_hours?: number;
  salary_min?: number;
  salary_max?: number;
  suburb: string;
  state: string;
  required_skills: string[];
  min_experience_years: number;
  business: { business_name: string; logo_url?: string; avg_rating?: number } | null;
}

export default function PermTab() {
  const [jobs, setJobs] = useState<PermJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("shifts")
      .select(`
        id, title, description, hourly_rate, weekly_hours,
        salary_min, salary_max, suburb, state,
        required_skills, min_experience_years,
        business:business_profiles(business_name, logo_url, avg_rating)
      `)
      .eq("status", "OPEN")
      .eq("job_type", "PERM")
      .order("created_at", { ascending: false })
      .limit(30);

    setJobs((data ?? []) as unknown as PermJob[]);
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
      <View style={styles.header}>
        <Text style={styles.title}>Permanent roles 💼</Text>
        <Text style={styles.subtitle}>{jobs.length} positions open</Text>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c5522a" />
        }
        renderItem={({ item: job }) => {
          const salaryDisplay = job.salary_min && job.salary_max
            ? `$${(job.salary_min / 1000).toFixed(0)}k–$${(job.salary_max / 1000).toFixed(0)}k/yr`
            : job.hourly_rate
            ? `$${job.hourly_rate}/hr`
            : null;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/shift/${job.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoEmoji}>☕</Text>
                </View>
                <View style={styles.cardMeta}>
                  <Text style={styles.bizName}>{job.business?.business_name}</Text>
                  <Text style={styles.location}>📍 {job.suburb}, {job.state}</Text>
                </View>
                {salaryDisplay && (
                  <Text style={styles.salary}>{salaryDisplay}</Text>
                )}
              </View>

              <Text style={styles.jobTitle}>{job.title}</Text>
              {job.description && (
                <Text style={styles.description} numberOfLines={2}>{job.description}</Text>
              )}

              <View style={styles.footer}>
                <View style={styles.skills}>
                  {job.required_skills.slice(0, 2).map((skill) => (
                    <View key={skill} style={styles.skillPill}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
                {job.weekly_hours && (
                  <Text style={styles.hours}>{job.weekly_hours} hrs/wk</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💼</Text>
            <Text style={styles.emptyText}>No permanent roles available right now.</Text>
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
    padding: 16,
    gap: 8,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#fff3ec",
    borderWidth: 1,
    borderColor: "#f0cdb8",
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 20 },
  cardMeta: { flex: 1 },
  bizName: { fontSize: 13, fontWeight: "700", color: "#1a1510" },
  location: { fontSize: 11, color: "#c5522a", fontWeight: "500", marginTop: 1 },
  salary: { fontSize: 14, fontWeight: "900", color: "#1a1510" },
  jobTitle: { fontSize: 16, fontWeight: "800", color: "#1a1510" },
  description: { fontSize: 13, color: "#6b5a4e", lineHeight: 19 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  skills: { flexDirection: "row", gap: 6 },
  skillPill: {
    backgroundColor: "#fafaf8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  skillText: { fontSize: 10, color: "#6b5a4e", fontWeight: "500" },
  hours: { fontSize: 12, color: "#9c8878" },
  empty: { padding: 40, alignItems: "center", gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 14, color: "#9c8878", textAlign: "center" },
});
