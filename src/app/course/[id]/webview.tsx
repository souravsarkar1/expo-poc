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
  { key: "player", label: appConstant.COURSE_PLAYER, icon: "play-circle-outline" },
  { key: "headers", label: appConstant.DEBUG_HEADERS, icon: "code-slash-outline" },
];

import { appConstant } from "../../../../constants/appText";
import { useTheme } from "../../theme/useTheme";

export default function CourseWebView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { palette } = useTheme();

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

  const playerRef = useRef<WebView>(null);
  const headersRef = useRef<WebView>(null);

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: palette.background }}>
        <Ionicons name="alert-circle-outline" size={56} color={palette.textSecondary} />
        <Text className="font-bold text-lg mt-4" style={{ color: palette.textPrimary }}>
          {appConstant.COURSE_NOT_FOUND}
        </Text>
        <Text className="text-sm mt-2" style={{ color: palette.textSecondary }}>
          {appConstant.THIS_COURSE_IS_NO_LONGER_AVAILABLE}
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
          `🎉 ${appConstant.CONGRATULATIONS}!`,
          appConstant.COURSE_MARKED_AS_COMPLETED,
          [{ text: `${appConstant.AWESOME}!` }]
        );
      }
    } catch (err) {
      console.error(appConstant.FAILED_TO_PARSE_WEBVIEW_MESSAGE, err);
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.background }} edges={["top"]}>


      <View className="flex-row mx-4 mb-2 p-1 rounded-xl" style={{ backgroundColor: palette.surface }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.8}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-lg ${isActive ? "shadow-sm" : ""
                }`}
              style={isActive ? { elevation: 2, backgroundColor: palette.background } : undefined}
              onPress={() => {
                setActiveTab(tab.key);
                setLoadError(null);
                setLoading(true);
              }}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={isActive ? palette.primary : palette.textSecondary}
              />
              <Text
                className="font-semibold text-xs"
                style={{ color: isActive ? palette.primary : palette.textSecondary }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-1 relative" style={{ backgroundColor: palette.background }}>
        {loadError ? (
          <View className="absolute inset-0 items-center justify-center p-6 z-10" style={{ backgroundColor: palette.background }}>
            <Ionicons name="cloud-offline-outline" size={56} color="#ef4444" />
            <Text className="font-bold text-base mt-4 text-center" style={{ color: palette.textPrimary }}>
              Failed to load content
            </Text>
            <Text className="text-sm text-center mt-2 mb-6 leading-relaxed" style={{ color: palette.textSecondary }}>
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
          <View className="absolute inset-0 items-center justify-center z-10" style={{ backgroundColor: palette.background }}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text className="text-sm mt-3" style={{ color: palette.textSecondary }}>
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
              setLoadError(e.nativeEvent.description || appConstant.UNKNOWN_LOAD_ERROR);
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
              setLoadError(e.nativeEvent.description || appConstant.CONNECTION_ERROR);
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