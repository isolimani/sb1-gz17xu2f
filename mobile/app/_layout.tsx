import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { registerForPushNotificationsAsync } from "@/lib/notifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2 }, // 2 minutes
  },
});

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
    registerForPushNotificationsAsync().catch(() => {
      // Push notifications may not be available in simulators
    });
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="shift/[id]" options={{ headerShown: true, title: "Shift details", headerTintColor: "#c5522a" }} />
      </Stack>
    </QueryClientProvider>
  );
}
