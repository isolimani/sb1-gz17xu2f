import { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, Image,
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";

interface MenuItem {
  icon: string;
  label: string;
  sub?: string;
  onPress: () => void;
  danger?: boolean;
}

export default function MoreTab() {
  const { userRow, worker, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/welcome");
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      icon: "✏️",
      label: "Edit profile",
      sub: "Bio, skills, rate, availability",
      onPress: () => router.push("/(auth)/onboarding/step1"),
    },
    {
      icon: "💳",
      label: "Payout setup",
      sub: worker?.stripe_account_id ? "Connected ✓" : "Set up bank account",
      onPress: () => Alert.alert("Payout", "Connect to Stripe to receive earnings directly."),
    },
    {
      icon: "🔔",
      label: "Notifications",
      sub: "Manage push notifications",
      onPress: () => Alert.alert("Coming soon", "Notification settings coming soon."),
    },
    {
      icon: "📖",
      label: "Community guidelines",
      onPress: () => Alert.alert("Guidelines", "Visit cuppa.com.au/community-guidelines"),
    },
    {
      icon: "📄",
      label: "Terms & Conditions",
      onPress: () => Alert.alert("Terms", "Visit cuppa.com.au/terms"),
    },
    {
      icon: "🔒",
      label: "Privacy Policy",
      onPress: () => Alert.alert("Privacy", "Visit cuppa.com.au/privacy"),
    },
    {
      icon: "🚪",
      label: "Log out",
      onPress: handleSignOut,
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {userRow?.avatar_url ? (
              <Image
                source={{ uri: userRow.avatar_url }}
                style={styles.avatarImg}
              />
            ) : (
              <Text style={styles.avatarInitial}>
                {userRow?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userRow?.name}</Text>
            <Text style={styles.profileEmail}>{userRow?.email}</Text>
            {worker?.vetting_status === "APPROVED" && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Verified barista</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Rating", value: worker?.avg_rating?.toFixed(1) ?? "New" },
            { label: "Shifts", value: String(worker?.total_shifts_completed ?? 0) },
            { label: "Completion", value: `${worker?.completion_rate ?? 100}%` },
            { label: "Karma", value: String(worker?.karma ?? 0) },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuText}>
                <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
                  {item.label}
                </Text>
                {item.sub && <Text style={styles.menuSub}>{item.sub}</Text>}
              </View>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>Cuppa v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafaf8" },
  scroll: { padding: 20, gap: 16 },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#fff3ec",
    borderWidth: 1,
    borderColor: "#f0cdb8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 60, height: 60 },
  avatarInitial: { fontSize: 26, fontWeight: "900", color: "#c5522a" },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 18, fontWeight: "800", color: "#1a1510" },
  profileEmail: { fontSize: 12, color: "#9c8878" },
  verifiedBadge: {
    marginTop: 4,
    backgroundColor: "#ecfdf5",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#a7f3d0",
  },
  verifiedText: { fontSize: 11, color: "#065f46", fontWeight: "600" },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    overflow: "hidden",
  },
  statItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "#e8e0d8",
    gap: 2,
  },
  statValue: { fontSize: 16, fontWeight: "900", color: "#1a1510" },
  statLabel: { fontSize: 10, color: "#9c8878" },
  menu: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e8e0d8",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0e8e0",
    gap: 12,
  },
  menuIcon: { fontSize: 20, width: 28, textAlign: "center" },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: "600", color: "#1a1510" },
  menuLabelDanger: { color: "#dc2626" },
  menuSub: { fontSize: 11, color: "#9c8878", marginTop: 1 },
  menuChevron: { fontSize: 20, color: "#c8bcb0" },
  version: { fontSize: 11, color: "#c8bcb0", textAlign: "center" },
});
