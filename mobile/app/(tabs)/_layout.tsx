import { Tabs, Redirect } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useAuthStore } from "@/store/authStore";

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { user, userRow, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (!user) return <Redirect href="/(auth)/welcome" />;
  if (user && !userRow?.has_worker_profile) return <Redirect href="/(auth)/onboarding/step1" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="temp"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="☕" label="Temp" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="perm"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💼" label="Perm" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💰" label="Earnings" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👤" label="More" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopColor: "#e8e0d8",
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
  },
  tabItem: { alignItems: "center", gap: 2 },
  emoji: { fontSize: 20 },
  tabLabel: { fontSize: 10, color: "#9c8878", fontWeight: "500" },
  tabLabelActive: { color: "#c5522a", fontWeight: "700" },
});
