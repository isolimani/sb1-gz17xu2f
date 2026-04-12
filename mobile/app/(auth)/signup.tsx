import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert("Sign up failed", error.message);
    } else {
      // Proceed to onboarding
      router.replace("/(auth)/onboarding/step1");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Join thousands of baristas on Cuppa — always free for workers.
          </Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Sam Torres"
                autoCapitalize="words"
                autoComplete="name"
                placeholderTextColor="#b0a090"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                placeholderTextColor="#b0a090"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                secureTextEntry
                placeholderTextColor="#b0a090"
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.btnText}>
                {loading ? "Creating account…" : "Create account"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.switchText}>
                Already have an account?{" "}
                <Text style={styles.switchLink}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafaf8" },
  kav: { flex: 1 },
  scroll: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40 },
  back: { marginBottom: 32 },
  backText: { color: "#c5522a", fontSize: 15 },
  title: { fontSize: 28, fontWeight: "900", color: "#1a1510", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#6b5a4e", marginBottom: 32, lineHeight: 22 },
  form: { gap: 16 },
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
  btn: {
    backgroundColor: "#c5522a",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  switchText: { textAlign: "center", fontSize: 13, color: "#6b5a4e", marginTop: 8 },
  switchLink: { color: "#c5522a", fontWeight: "600" },
});
