import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

const BARISTA_SKILLS = [
  "Espresso", "Manual pour-over", "Cold brew", "Latte art",
  "Milk texturing", "Rush service", "Batch brewing", "Specialty coffee",
  "Cupping / tasting", "Bar setup & close", "POS systems",
  "Food handling", "Bar management",
] as const;

// Step 2: Skills selection
export default function OnboardingStep2() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggle = (skill: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const handleNext = async () => {
    if (selected.size === 0) {
      Alert.alert("Please select at least one skill.");
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    await supabase
      .from("worker_profiles")
      .update({ skills: Array.from(selected) })
      .eq("user_id", user.id);

    setLoading(false);
    router.push("/(auth)/onboarding/step3");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progress}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={[styles.dot, s <= 2 && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.step}>Step 2 of 4</Text>
        <Text style={styles.title}>Your barista skills</Text>
        <Text style={styles.subtitle}>Select all that apply</Text>

        <View style={styles.grid}>
          {BARISTA_SKILLS.map((skill) => {
            const active = selected.has(skill);
            return (
              <TouchableOpacity
                key={skill}
                style={[styles.skill, active && styles.skillActive]}
                onPress={() => toggle(skill)}
              >
                <Text style={[styles.skillText, active && styles.skillTextActive]}>
                  {skill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.count}>{selected.size} selected</Text>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? "Saving…" : "Next →"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafaf8" },
  scroll: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40, gap: 16 },
  progress: { flexDirection: "row", gap: 6, marginBottom: 8 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "#e8e0d8" },
  dotActive: { backgroundColor: "#c5522a" },
  step: { fontSize: 12, color: "#9c8878", fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "900", color: "#1a1510" },
  subtitle: { fontSize: 15, color: "#6b5a4e", marginTop: -8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e8e0d8",
    backgroundColor: "#ffffff",
  },
  skillActive: { borderColor: "#c5522a", backgroundColor: "#fff3ec" },
  skillText: { fontSize: 13, color: "#6b5a4e", fontWeight: "500" },
  skillTextActive: { color: "#c5522a", fontWeight: "700" },
  count: { fontSize: 13, color: "#9c8878", textAlign: "center" },
  btn: {
    backgroundColor: "#c5522a",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
