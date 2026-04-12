import { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, ActivityIndicator, TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { format, parseISO, differenceInHours } from "date-fns";

interface Shift {
  id: string;
  title: string;
  description?: string;
  equipment?: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  suburb: string;
  state: string;
  address: string;
  required_skills: string[];
  min_experience_years: number;
  dress_code?: string;
  notes?: string;
  status: string;
  job_type: string;
  business: { business_name: string; logo_url?: string; avg_rating?: number; karma?: number; total_jobs_posted?: number } | null;
}

interface Application {
  id: string;
  status: string;
  message?: string;
}

export default function ShiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, worker } = useAuthStore();
  const [shift, setShift] = useState<Shift | null>(null);
  const [myApp, setMyApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);

  const load = async () => {
    const [{ data: shiftData }, { data: appData }] = await Promise.all([
      supabase
        .from("shifts")
        .select(`
          *,
          business:business_profiles(business_name, logo_url, avg_rating, karma, total_jobs_posted)
        `)
        .eq("id", id)
        .single(),
      user
        ? supabase
            .from("applications")
            .select("id, status, message")
            .eq("shift_id", id)
            .eq("worker_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    setShift(shiftData as unknown as Shift);
    setMyApp(appData as Application | null);
    setLoading(false);
  };

  useEffect(() => { if (id) load(); }, [id]);

  const handleApply = async () => {
    if (!user) { router.push("/(auth)/login"); return; }
    if (worker?.vetting_status !== "APPROVED") {
      Alert.alert("Profile under review", "You can apply once your profile is approved.");
      return;
    }

    setApplying(true);
    const { error } = await supabase.from("applications").insert({
      shift_id: id,
      worker_id: user.id,
      status: "PENDING",
      message: message.trim() || null,
    });
    setApplying(false);

    if (error) {
      if (error.code === "23505") {
        Alert.alert("Already applied", "You have already applied for this shift.");
      } else {
        Alert.alert("Error", error.message);
      }
    } else {
      setShowApplyForm(false);
      await load();
    }
  };

  const handleAcceptOffer = async () => {
    if (!myApp) return;
    Alert.alert("Accept offer", "Confirm you want to take this shift?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        onPress: async () => {
          const res = await fetch(`/api/applications/${myApp.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ACCEPTED" }),
          });
          if (res.ok) await load();
        },
      },
    ]);
  };

  const handleDeclineOffer = async () => {
    if (!myApp) return;
    Alert.alert("Decline offer", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: async () => {
          await fetch(`/api/applications/${myApp.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "DECLINED" }),
          });
          await load();
        },
      },
    ]);
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

  if (!shift) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Shift not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const start = parseISO(shift.start_time);
  const end = parseISO(shift.end_time);
  const hours = differenceInHours(end, start);
  const estimatedPay = shift.hourly_rate * hours;
  const biz = shift.business;

  const statusLabels: Record<string, string> = {
    PENDING: "Applied — awaiting response",
    OFFERED: "You have been offered this shift!",
    ACCEPTED: "Confirmed — shift is yours",
    REJECTED: "Not selected",
    DECLINED: "Declined",
    WITHDRAWN: "Withdrawn",
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Business header */}
      <View style={styles.bizHeader}>
        <View style={styles.bizLogo}>
          <Text style={styles.bizLogoEmoji}>☕</Text>
        </View>
        <View style={styles.bizInfo}>
          <Text style={styles.bizName}>{biz?.business_name}</Text>
          {biz?.avg_rating != null && (
            <Text style={styles.bizRating}>
              {"★".repeat(Math.round(biz.avg_rating))} {biz.avg_rating.toFixed(1)}
              {" · "}{biz.karma ?? 0} karma
            </Text>
          )}
        </View>
      </View>

      {/* Shift title & core info */}
      <View style={styles.card}>
        <Text style={styles.shiftTitle}>{shift.title}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅</Text>
          <Text style={styles.infoValue}>{format(start, "EEEE d MMMM")}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⏰</Text>
          <Text style={styles.infoValue}>
            {format(start, "h:mm a")} – {format(end, "h:mm a")} ({hours} hrs)
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍</Text>
          <Text style={styles.infoValue}>{shift.address}, {shift.suburb}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>💰</Text>
          <Text style={styles.infoValue}>
            ${shift.hourly_rate}/hr — you earn ~${estimatedPay.toFixed(0)} total
          </Text>
        </View>
        {shift.equipment && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>⚙️</Text>
            <Text style={styles.infoValue}>{shift.equipment}</Text>
          </View>
        )}
        {shift.dress_code && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👔</Text>
            <Text style={styles.infoValue}>{shift.dress_code}</Text>
          </View>
        )}
      </View>

      {/* Description */}
      {shift.description && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>About this shift</Text>
          <Text style={styles.description}>{shift.description}</Text>
        </View>
      )}

      {/* Skills */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Required skills</Text>
        <View style={styles.skillsGrid}>
          {shift.required_skills.map((skill) => (
            <View key={skill} style={styles.skillPill}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.expNote}>Min. {shift.min_experience_years} yr{shift.min_experience_years !== 1 ? "s" : ""} experience</Text>
      </View>

      {/* Notes */}
      {shift.notes && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes from business</Text>
          <Text style={styles.description}>{shift.notes}</Text>
        </View>
      )}

      {/* Application status or CTA */}
      {shift.status === "OPEN" && (
        <View style={styles.ctaSection}>
          {myApp ? (
            <View style={styles.appStatus}>
              <Text style={styles.appStatusText}>
                {statusLabels[myApp.status] ?? myApp.status}
              </Text>
              {myApp.status === "OFFERED" && (
                <View style={styles.offerActions}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={handleAcceptOffer}>
                    <Text style={styles.acceptBtnText}>Accept offer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={handleDeclineOffer}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : showApplyForm ? (
            <View style={styles.applyForm}>
              <Text style={styles.applyFormLabel}>Cover note (optional)</Text>
              <TextInput
                style={styles.applyInput}
                value={message}
                onChangeText={setMessage}
                placeholder="I'm an experienced barista with 5 years..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#b0a090"
              />
              <View style={styles.applyActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowApplyForm(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, applying && styles.submitBtnDisabled]}
                  onPress={handleApply}
                  disabled={applying}
                >
                  <Text style={styles.submitBtnText}>
                    {applying ? "Applying…" : "Submit application"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setShowApplyForm(true)}
            >
              <Text style={styles.applyBtnText}>Apply for this shift</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {shift.status !== "OPEN" && (
        <View style={styles.closedBanner}>
          <Text style={styles.closedText}>
            This shift is no longer accepting applications ({shift.status.toLowerCase()}).
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafaf8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  bizHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  bizLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#fff3ec",
    borderWidth: 1,
    borderColor: "#f0cdb8",
    alignItems: "center",
    justifyContent: "center",
  },
  bizLogoEmoji: { fontSize: 24 },
  bizInfo: { flex: 1 },
  bizName: { fontSize: 17, fontWeight: "800", color: "#1a1510" },
  bizRating: { fontSize: 12, color: "#c5522a", marginTop: 2 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    padding: 16,
    gap: 8,
  },
  shiftTitle: { fontSize: 20, fontWeight: "900", color: "#1a1510" },
  infoRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  infoLabel: { fontSize: 14, width: 24, textAlign: "center" },
  infoValue: { fontSize: 14, color: "#1a1510", flex: 1, lineHeight: 20 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#9c8878", textTransform: "uppercase", letterSpacing: 0.5 },
  description: { fontSize: 14, color: "#6b5a4e", lineHeight: 21 },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillPill: {
    backgroundColor: "#fafaf8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skillText: { fontSize: 12, color: "#6b5a4e", fontWeight: "500" },
  expNote: { fontSize: 12, color: "#9c8878" },
  ctaSection: { gap: 10 },
  appStatus: {
    backgroundColor: "#fff3ec",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f0cdb8",
    padding: 16,
    gap: 12,
  },
  appStatusText: { fontSize: 14, fontWeight: "700", color: "#c5522a", textAlign: "center" },
  offerActions: { flexDirection: "row", gap: 10 },
  acceptBtn: {
    flex: 1,
    backgroundColor: "#c5522a",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  acceptBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  declineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#e8e0d8",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  declineBtnText: { color: "#6b5a4e", fontSize: 15, fontWeight: "600" },
  applyForm: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    padding: 16,
    gap: 10,
  },
  applyFormLabel: { fontSize: 13, fontWeight: "600", color: "#6b5a4e" },
  applyInput: {
    backgroundColor: "#fafaf8",
    borderWidth: 1,
    borderColor: "#e8e0d8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1a1510",
    textAlignVertical: "top",
    minHeight: 80,
  },
  applyActions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#e8e0d8",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: { color: "#6b5a4e", fontSize: 14, fontWeight: "600" },
  submitBtn: {
    flex: 2,
    backgroundColor: "#c5522a",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
  applyBtn: {
    backgroundColor: "#c5522a",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
  },
  applyBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  closedBanner: {
    backgroundColor: "#f0e8e0",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  closedText: { fontSize: 13, color: "#6b5a4e", textAlign: "center" },
  errorText: { fontSize: 15, color: "#9c8878" },
});
