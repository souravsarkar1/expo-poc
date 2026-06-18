import NetInfo from "@react-native-community/netinfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import "../../global.css";
import { requestNotificationPermissions, scheduleInactivityReminder } from "../../services/notificationService";
import { useAuthStore } from "../../stores/authStore";

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);

  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadStoredAuth();

    const unsubscribeNet = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });

    requestNotificationPermissions()
      .then((granted) => {
        if (granted) {
          scheduleInactivityReminder();
        }
      })
      .catch((err) => {
        console.warn("Notification permissions or reminder setup failed:", err);
      });

    return () => {
      unsubscribeNet();
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <View className="flex-1">
          {isOffline && (
            <SafeAreaView className="bg-red-500 z-50">
              <View className={`items-center justify-center py-2 ${Platform.OS === 'android' ? 'pt-4' : ''}`}>
                <Text className="text-white text-xs font-semibold">
                  ⚠️ Connection Lost. Operating in Offline Mode.
                </Text>
              </View>
            </SafeAreaView>
          )}
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="course/[id]"
              options={{
                title: "Course Details",
                headerShown: true,
                headerBackTitle: "Back",
                headerTintColor: "#1f2937",
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
            <Stack.Screen
              name="course/[id]/webview"
              options={{
                title: "Course Content",
                headerShown: true,
                headerBackTitle: "Details",
                headerTintColor: "#1f2937",
                headerTitleStyle: { fontWeight: "600" },
              }}
            />
          </Stack>
        </View>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}