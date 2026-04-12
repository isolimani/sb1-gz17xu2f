import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

// Step 1: Bio + photo + years of experience
export default function OnboardingStep1() {
  const [bio, setBio] = useState("");
  const [years, setYears] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    if (!years || isNaN(parseInt(years))) {
      Alert.alert("Please enter your years of experience.");
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Upload photo if selected
    let avatarUrl: string | undefined;
    if (photoUri) {
      const ext = photoUri.split(".").pop() ?? "jpg";
      const path = `avatars/${user.id}.${ext}`;
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: `image/${ext}` });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);
        avatarUrl = publicUrl;
        await supabase.from("users").update({ avatar_url: avatarUrl }).eq("id", user.id);
      }
    }

    // Save partial worker profile (will be completed in later steps)
    await supabase.from("worker_profiles").upsert({
      user_id: user.id,
      bio: bio.trim(),
      years_experience: parseInt(years),
      skills: [],
      certifications: [],
      hourly_rate_min: 30,
      vetting_status: "PENDING",
      total_shifts_completed: 0,
      completion_rate: 100,
      karma: 0,
    }, { onConflict: "user_id" });

    setLoading(false);
    router.push("/(auth)/onboarding/step2");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Progress */}
        <View style={styles.progress}>
          {[1, 2, 3, 4].map((s) => (
            <View key={s} style={[styles.dot, s === 1 && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.step}>Step 1 of 4</Text>
        <Text style={styles.title}>Tell us about yourself</Text>

        {/* Photo */}
        <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
          {photoUri ? (
            <Text style={styles.photoSelected}>✓ Photo selected</Text>
          ) : (
            <Text style={styles.photoPlaceholder}>+ Add profile photo</Text>
          )}
        </TouchableOpacity>

        <View style={styles.field}>
          <Text style={styles.label}>Years of barista experience</Text>
          <TextInput
            style={styles.input}
            value={years}
            onChangeText={setYears}
            placeholder="e.g. 3"
            keyboardType="number-pad"
            placeholderTextColor="#b0a090"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bio (optional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={bio}
            onChangeText={setBio}
            placeholder="I've been making espresso for 5 years..."
            multiline
            numberOfLines={4}
            placeholderTextColor="#b0a090"
          />
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
  dot: {
    flex: 1, height: 4, borderRadius: 2, backgroundColor: "#e8e0d8",
  },
  dotActive: { backgroundColor: "#c5522a" },
  step: { fontSize: 12, color: "#9c8878", fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "900", color: "#1a1510" },
  photoBtn: {
    backgroundColor: "#fff3ec",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#f0cdb8",
    borderStyle: "dashed",
    paddingVertical: 28,
    alignItems: "center",
  },
  photoPlaceholder: { color: "#c5522a", fontSize: 15, fontWeight: "600" },
  photoSelected: { color: "#2a9d5c", fontSize: 15, fontWeight: "600" },
  field: { gap: 6 },
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
  textarea: { height: 100, textAlignVertical: "top" },
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
