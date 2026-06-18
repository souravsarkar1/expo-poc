import { useTheme } from "@/app/theme/useTheme";
import { getCourseVideo } from "@/assets/utils/getCourseVideo";
import { Ionicons } from "@expo/vector-icons";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { appConstant } from "../../../constants/appText";
import { trigger5BookmarksNotification } from "../../../services/notificationService";
import { useBookmarkStore } from "../../../stores/bookmarkStore";
import { useEnrollmentStore } from "../../../stores/enrollmentStore";
import { Course } from "../../../types/course";

const COURSE_CONTENT_LIST = [
  {
    title: appConstant.HOURS_HIGH_QUALITY_VIDEO,
    icon: "videocam-outline",
  },
  {
    title: appConstant.ARTICLES_AND_DOWNLOADABLE_RESOURCES,
    icon: "document-text-outline",
  },
  {
    title: appConstant.CERTIFICATE_OF_COMPLETION_UPON_REQUEST,
    icon: "ribbon-outline",
  },
];

export default function CourseDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { palette } = useTheme();

  const coursesData = queryClient.getQueryData<
    InfiniteData<{
      courses: Course[];
      nextPage?: number;
    }>
  >(["courses"]);

  const courses =
    coursesData?.pages.flatMap((page) => page.courses) ?? [];

  const course = courses.find((c) => c.id === id);


  const videoId = getCourseVideo(
    course?.title ?? "",
    course?.category ?? ""
  );

  const isBookmarked = useBookmarkStore((s) => s.isBookmarked(id));
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);

  const isEnrolled = useEnrollmentStore((s) => s.isEnrolled(id));
  const enroll = useEnrollmentStore((s) => s.enroll);

  const [enrolling, setEnrolling] = useState(false);
  const [playing, setPlaying] = useState(false);

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center p-6" style={{ backgroundColor: palette.background }}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="font-bold text-lg mt-4 text-center" style={{ color: palette.textPrimary }}>
          {appConstant.COURSE_NOT_FOUND}
        </Text>
        <Text className="text-sm text-center mt-2 mb-6" style={{ color: palette.textSecondary }}>
          {appConstant.THE_COURSE_YOU_ARE_LOOKING_FOR_MIGHT_HAVE_BEEN_REMOVED_OR_IS_UNAVAILABLE}
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-xl shadow-sm"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">{appConstant.GO_BACK}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBookmarkPress = () => {
    toggleBookmark(course.id);
    setTimeout(() => {
      const bookmarkedIds = useBookmarkStore.getState().bookmarkedIds;
      if (bookmarkedIds.length >= 5) {
        trigger5BookmarksNotification();
      }
    }, 50);
  };

  const handleEnrollPress = () => {
    if (isEnrolled) {
      router.push(`/course/${course.id}/webview`);
    } else {
      setEnrolling(true);
      setTimeout(() => {
        enroll(course.id);
        setEnrolling(false);
        Alert.alert(
          appConstant.ENROLLED_SUCCESSFULLY,
          appConstant.ENROLLED_SUCCESSFULLY_MESSAGE,
          [
            {
              text: appConstant.START_LEARNING,
              onPress: () => router.push(`/course/${course.id}/webview`),
            },
            { text: appConstant.DISMISS, style: "cancel" },
          ]
        );
      }, 800);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: palette.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <YoutubePlayer
          height={250}
          play={playing}
          videoId={videoId}
          onChangeState={(state: any) => {
            if (state === "ended") {
              setPlaying(false);
            }
          }}
        />
        <View className="p-6">
          <View className="bg-blue-50 px-3 py-1 rounded-full self-start mb-4">
            <Text className="text-blue-600 text-xs font-bold capitalize">
              {course.category}
            </Text>
          </View>

          <Text className="text-2xl font-bold leading-tight" style={{ color: palette.textPrimary }}>
            {course.title}
          </Text>

          <View className="flex-row items-center justify-between mt-4 pb-4 border-b" style={{ borderBottomColor: palette.border }}>
            <View className="flex-row items-center">
              <Image
                source={{ uri: course.instructor.avatar }}
                className="w-10 h-10 rounded-full border"
                style={{ borderColor: palette.border }}
                resizeMode="contain"
              />
              <View className="ml-3">
                <Text style={{ color: palette.textSecondary, fontSize: 10, fontWeight: "500" }}>{appConstant.INSTRUCTOR}</Text>
                <Text className="font-semibold text-sm" style={{ color: palette.textPrimary }}>
                  {course.instructor.name}
                </Text>
                <Text style={{ color: palette.textSecondary, fontSize: 11, fontWeight: "500" }}>
                  {course.instructor.location.city + ", " + course.instructor.location.country}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center px-3 py-1.5 rounded-xl" style={{ backgroundColor: palette.surface }}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text className="font-bold text-sm ml-1.5" style={{ color: palette.textPrimary }}>
                {course.rating.toFixed(1)}
              </Text>
            </View>
          </View>

          <View className="my-5 flex-row items-center justify-between">
            <View>
              <Text style={{ color: palette.textSecondary, fontSize: 11, fontWeight: "500" }}>{appConstant.COURSE_FEE}</Text>
              <Text className="text-3xl font-extrabold mt-1" style={{ color: palette.primary }}>
                ${course.price.toFixed(2)}
              </Text>
            </View>
            <View className="bg-green-50 px-3 py-1.5 rounded-xl">
              <Text className="text-green-600 text-xs font-bold">{appConstant.LIFETIME_ACCESS}</Text>
            </View>
          </View>

          <View className="mt-2">
            <Text className="font-bold text-base mb-2" style={{ color: palette.textPrimary }}>
              {appConstant.ABOUT_THIS_COURSE}
            </Text>
            <Text className="leading-relaxed text-sm" style={{ color: palette.textSecondary }}>
              {course.description}
            </Text>
          </View>

          <View className="mt-6 rounded-2xl p-4 border gap-y-3" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
            {/* COurse content list */}
            {COURSE_CONTENT_LIST.map((item, index) => (
              <View className="flex-row items-center" key={index}>
                {/* @ts-ignore */}
                <Ionicons name={item.icon} size={20} color={palette.primary} />
                <Text className="text-sm ml-3 font-medium" style={{ color: palette.textPrimary }}>
                  {item.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t px-6 pt-3 pb-7 flex-row items-center justify-between shadow-2xl" style={{ backgroundColor: palette.background, borderTopColor: palette.border }}>
        <TouchableOpacity
          className="w-14 h-14 rounded-2xl items-center justify-center border"
          style={{
            backgroundColor: isBookmarked ? palette.surface : palette.background,
            borderColor: palette.border,
          }}
          onPress={handleBookmarkPress}
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isBookmarked ? palette.primary : palette.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 h-14 rounded-2xl items-center justify-center ml-4 shadow-sm ${isEnrolled ? "bg-green-500" : "bg-blue-500"
            }`}
          onPress={handleEnrollPress}
          disabled={enrolling}
        >
          {enrolling ? (
            <View className="flex-row items-center">
              <Text className="text-white font-semibold mr-2">{appConstant.ENROLLING_DOTS}</Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-base">
              {isEnrolled ? appConstant.RESUME_LEARNING : appConstant.ENROLL_NOW}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
