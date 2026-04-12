import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function AuthLayout() {
  const { user, userRow, isLoading } = useAuthStore();

  if (isLoading) return null;

  // Already logged in with a profile → go to app
  if (user && userRow?.has_worker_profile) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
