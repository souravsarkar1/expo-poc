import { localHtml } from "@/assets/constants/htmlContent";
import { Ionicons } from "@expo/vector-icons";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useAuthStore } from "../../../../stores/authStore";
import { useEnrollmentStore } from "../../../../stores/enrollmentStore";
import { Course } from "../../../../types/course";

type Tab = "player" | "headers";

const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "player", label: "Course Player", icon: "play-circle-outline" },
  { key: "headers", label: "Debug Headers", icon: "code-slash-outline" },
];

export default function CourseWebView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const coursesData = queryClient.getQueryData<
    InfiniteData<{
      courses: Course[];
      nextPage?: number;
    }>
  >(["courses"]);
  const courses = coursesData?.pages.flatMap((page) => page.courses) ?? [];
  const course = courses.find((c) => c.id === id);

  const isCompleted = useEnrollmentStore((s) => s.isCompleted(id));
  const complete = useEnrollmentStore((s) => s.complete);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [activeTab, setActiveTab] = useState<Tab>("player");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Separate refs per WebView. Sharing one ref across two different
  // WebView instances (different `source` shapes) was the likely
  // crash source when switching tabs.
  const playerRef = useRef<WebView>(null);
  const headersRef = useRef<WebView>(null);

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 p-6">
        <Ionicons name="alert-circle-outline" size={56} color="#94a3b8" />
        <Text className="text-slate-900 font-bold text-lg mt-4">
          Course Not Found
        </Text>
        <Text className="text-slate-500 text-sm mt-2">
          This course is no longer available
        </Text>
      </View>
    );
  }

  const customHeaders = {
    Authorization: `Bearer ${accessToken || ""}`,
    "X-Course-Id": id,
    "X-Device-OS": Platform.OS,
  };

  const injectedJS = `
    window.courseId = "${id}";
    setupCourseData(${JSON.stringify({ ...course, isCompleted })});
    true;
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "COMPLETE_COURSE") {
        complete(data.courseId);
        playerRef.current?.injectJavaScript("setCompletedUI(); true;");
        Alert.alert(
          "🎉 Congratulations!",
          "Course marked as completed. You've achieved an amazing milestone!",
          [{ text: "Awesome!" }]
        );
      }
    } catch (err) {
      console.error("Failed to parse webview message", err);
    }
  };

  const handleRetry = () => {
    setLoadError(null);
    setLoading(true);
    if (activeTab === "player") {
      playerRef.current?.reload();
    } else {
      headersRef.current?.reload();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>


      {/* Segmented tab control */}
      <View className="flex-row bg-slate-100 mx-4 mb-2 p-1 rounded-xl">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg ${isActive ? "bg-white shadow-sm" : ""
                }`}
              style={isActive ? { elevation: 2 } : undefined}
              onPress={() => {
                setActiveTab(tab.key);
                setLoadError(null);
                setLoading(true);
              }}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? "#4f46e5" : "#64748b"}
              />
              <Text
                className={`font-semibold text-xs ${isActive ? "text-indigo-600" : "text-slate-500"
                  }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* WebView area */}
      <View className="flex-1 relative bg-white">
        {loadError ? (
          <View className="absolute inset-0 bg-white items-center justify-center p-6 z-10">
            <Ionicons name="cloud-offline-outline" size={56} color="#ef4444" />
            <Text className="text-slate-900 font-bold text-base mt-4 text-center">
              Failed to load content
            </Text>
            <Text className="text-slate-500 text-sm text-center mt-2 mb-6 leading-relaxed">
              {loadError}
            </Text>
            <TouchableOpacity
              className="bg-indigo-600 px-8 py-3.5 rounded-xl flex-row items-center gap-2"
              onPress={handleRetry}
            >
              <Ionicons name="reload" size={18} color="white" />
              <Text className="text-white font-semibold text-sm">
                Retry Loading
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {loading && !loadError ? (
          <View className="absolute inset-0 items-center justify-center bg-white z-10">
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text className="text-slate-400 text-sm mt-3">
              {activeTab === "player" ? "Loading course content…" : "Loading headers…"}
            </Text>
          </View>
        ) : null}

        {activeTab === "player" ? (
          <WebView
            key="player"
            ref={playerRef}
            originWhitelist={["*"]}
            source={{ html: localHtml }}
            injectedJavaScript={injectedJS}
            onMessage={handleWebViewMessage}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={(e) => {
              setLoadError(e.nativeEvent.description || "Unknown load error");
              setLoading(false);
            }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
          />
        ) : (
          <WebView
            key="headers"
            ref={headersRef}
            source={{ uri: "https://httpbin.org/headers", headers: customHeaders }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={(e) => {
              setLoadError(e.nativeEvent.description || "Connection error");
              setLoading(false);
            }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
          />
        )}
      </View>
    </SafeAreaView>
  );
}