import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

const AU_STATES = ["VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"] as const;

// Step 3: Rate + location
export default function OnboardingStep3() {
  const [rate, setRate] = useState("35");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState<string>("VIC");
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum < 25) {
      Alert.alert("Minimum rate is $25/hr (award wage).");
      return;
    }
    if (!suburb) {
      Alert.alert("Please enter your suburb.");
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    await supabase
      .from("worker_profiles")
      .update({ hourly_rate_min: rateNum, suburb, state })
      .eq("user_id", user.id);

    setLoading(false);
    router.push("/(auth)/onboarding/step4");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.progress}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={[styles.dot, s <= 3 && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.step}>Step 3 of 4</Text>
        <Text style={styles.title}>Your rate & location</Text>

        {/* Rate */}
        <View style={styles.field}>
          <Text style={styles.label}>Minimum hourly rate (AUD)</Text>
          <View style={styles.rateRow}>
            <Text style={styles.dollar}>$</Text>
            <TextInput
              style={[styles.input, styles.rateInput]}
              value={rate}
              onChangeText={setRate}
              keyboardType="numeric"
              placeholderTextColor="#b0a090"
            />
            <Text style={styles.perHr}>/hr</Text>
          </View>
          <Text style={styles.hint}>
            Businesses see your rate. Cuppa never deducts from your earnings.
          </Text>
        </View>

        {/* Suburb */}
        <View style={styles.field}>
          <Text style={styles.label}>Your suburb</Text>
          <TextInput
            style={styles.input}
            value={suburb}
            onChangeText={setSuburb}
            placeholder="Fitzroy"
            autoCapitalize="words"
            placeholderTextColor="#b0a090"
          />
        </View>

        {/* State */}
        <View style={styles.field}>
          <Text style={styles.label}>State</Text>
          <View style={styles.stateGrid}>
            {AU_STATES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.stateBtn, state === s && styles.stateBtnActive]}
                onPress={() => setState(s)}
              >
                <Text style={[styles.stateBtnText, state === s && styles.stateBtnTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
  scroll: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40, gap: 20 },
  progress: { flexDirection: "row", gap: 6, marginBottom: 8 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "#e8e0d8" },
  dotActive: { backgroundColor: "#c5522a" },
  step: { fontSize: 12, color: "#9c8878", fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "900", color: "#1a1510" },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#6b5a4e" },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e8e0d8",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#1a1510",
  },
  rateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dollar: { fontSize: 18, color: "#6b5a4e", fontWeight: "700" },
  rateInput: { flex: 1 },
  perHr: { fontSize: 15, color: "#6b5a4e" },
  hint: { fontSize: 12, color: "#9c8878", lineHeight: 17 },
  stateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stateBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e8e0d8",
    backgroundColor: "#ffffff",
  },
  stateBtnActive: { borderColor: "#c5522a", backgroundColor: "#fff3ec" },
  stateBtnText: { fontSize: 13, color: "#6b5a4e", fontWeight: "600" },
  stateBtnTextActive: { color: "#c5522a" },
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
