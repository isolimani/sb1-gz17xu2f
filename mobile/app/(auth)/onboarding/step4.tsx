import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

// Step 4: Done! Profile under review
export default function OnboardingStep4() {
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Mark user as having a worker profile
    await supabase
      .from("users")
      .update({ has_worker_profile: true })
      .eq("id", user.id);

    setLoading(false);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progress}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={styles.dotActive} />
          ))}
        </View>

        {/* Illustration */}
        <View style={styles.illustration}>
          <Text style={styles.emoji}>☕</Text>
        </View>

        <Text style={styles.title}>You&apos;re all set!</Text>
        <Text style={styles.subtitle}>
          Your profile is being reviewed by our team. You&apos;ll receive a push notification
          as soon as you&apos;re approved — usually within 24 hours.
        </Text>

        <View style={styles.checklist}>
          {[
            "Profile submitted",
            "Skills added",
            "Rate & location set",
            "Under review ⏳",
          ].map((item, i) => (
            <View key={item} style={styles.checkItem}>
              <Text style={[styles.checkIcon, i === 3 ? styles.checkPending : styles.checkDone]}>
                {i === 3 ? "○" : "✓"}
              </Text>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.browseNote}>
          You can browse shifts while you wait — you&apos;ll be able to apply once approved.
        </Text>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleFinish}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Loading…" : "Browse shifts →"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafaf8" },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  progress: { flexDirection: "row", gap: 6 },
  dotActive: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "#c5522a" },
  illustration: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emoji: { fontSize: 72 },
  title: { fontSize: 28, fontWeight: "900", color: "#1a1510", textAlign: "center" },
  subtitle: {
    fontSize: 15,
    color: "#6b5a4e",
    textAlign: "center",
    lineHeight: 23,
  },
  checklist: { gap: 10 },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkIcon: { fontSize: 16, width: 20, textAlign: "center" },
  checkDone: { color: "#2a9d5c" },
  checkPending: { color: "#9c8878" },
  checkText: { fontSize: 14, color: "#1a1510", fontWeight: "500" },
  browseNote: {
    fontSize: 13,
    color: "#9c8878",
    textAlign: "center",
    lineHeight: 19,
  },
  btn: {
    backgroundColor: "#c5522a",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: "auto",
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
