import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from "react-native";
import { router } from "expo-router";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <Text style={styles.logoEmoji}>☕</Text>
          <Text style={styles.logoText}>cuppa</Text>
          <Text style={styles.tagline}>Barista shifts. Fairly priced.</Text>
        </View>

        {/* Feature pills */}
        <View style={styles.features}>
          {[
            "✓ 0% fee for baristas — always",
            "✓ Vetted shifts near you",
            "✓ Same-day payouts via Stripe",
          ].map((f) => (
            <View key={f} style={styles.featurePill}>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctas}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/(auth)/signup")}
          >
            <Text style={styles.primaryBtnText}>Get started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.secondaryBtnText}>Log in</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legalText}>
          By continuing you agree to our{" "}
          <Text style={styles.link}>Terms</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafaf8" },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 32,
    justifyContent: "space-between",
  },
  logoSection: { alignItems: "center", paddingTop: 40 },
  logoEmoji: { fontSize: 56 },
  logoText: {
    fontSize: 40,
    fontWeight: "900",
    color: "#1a1510",
    letterSpacing: -1,
    marginTop: 8,
  },
  tagline: { fontSize: 15, color: "#6b5a4e", marginTop: 8 },
  features: { gap: 10 },
  featurePill: {
    backgroundColor: "#fff3ec",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#f0cdb8",
  },
  featureText: { fontSize: 14, color: "#c5522a", fontWeight: "600" },
  ctas: { gap: 12 },
  primaryBtn: {
    backgroundColor: "#c5522a",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e8e0d8",
  },
  secondaryBtnText: { color: "#1a1510", fontSize: 16, fontWeight: "600" },
  legalText: { textAlign: "center", fontSize: 11, color: "#9c8878" },
  link: { color: "#c5522a" },
});
