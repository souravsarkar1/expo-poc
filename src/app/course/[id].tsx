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
import { trigger5BookmarksNotification } from "../../../services/notificationService";
import { useBookmarkStore } from "../../../stores/bookmarkStore";
import { useEnrollmentStore } from "../../../stores/enrollmentStore";
import { Course } from "../../../types/course";

export default function CourseDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

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
      <View className="flex-1 items-center justify-center bg-gray-50 p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-gray-900 font-bold text-lg mt-4 text-center">
          Course Not Found
        </Text>
        <Text className="text-gray-500 text-sm text-center mt-2 mb-6">
          The course you are looking for might have been removed or is unavailable.
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-6 py-3 rounded-xl shadow-sm"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
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
      // Go to WebView course content viewer
      router.push(`/course/${course.id}/webview`);
    } else {
      setEnrolling(true);
      // Simulate API enroll network delay
      setTimeout(() => {
        enroll(course.id);
        setEnrolling(false);
        Alert.alert(
          "Enrolled Successfully!",
          "Congratulations! You are now enrolled in this course. Start learning today!",
          [
            {
              text: "Start Learning",
              onPress: () => router.push(`/course/${course.id}/webview`),
            },
            { text: "Dismiss", style: "cancel" },
          ]
        );
      }, 800);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image */}
        {/* <Image
          source={{ uri: course.thumbnail }}
          className="w-full h-64 bg-gray-100"
          resizeMode="cover"
        /> */}
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

          <Text className="text-2xl font-bold text-gray-900 leading-tight">
            {course.title}
          </Text>

          <View className="flex-row items-center justify-between mt-4 pb-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Image
                source={{ uri: course.instructor.avatar }}
                className="w-10 h-10 rounded-full border border-gray-200"
                resizeMode="contain"
              />
              <View className="ml-3">
                <Text className="text-gray-400 text-xs font-medium">Instructor</Text>
                <Text className="text-gray-800 font-semibold text-sm">
                  {course.instructor.name}
                </Text>
                <Text className="text-gray-600 text-xs font-medium">
                  {course.instructor.location.city + ", " + course.instructor.location.country}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-amber-50 px-3 py-1.5 rounded-xl">
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text className="text-gray-800 font-bold text-sm ml-1.5">
                {course.rating.toFixed(1)}
              </Text>
            </View>
          </View>

          <View className="my-5 flex-row items-center justify-between">
            <View>
              <Text className="text-gray-400 text-xs font-medium">Course Fee</Text>
              <Text className="text-3xl font-extrabold text-blue-600 mt-1">
                ${course.price.toFixed(2)}
              </Text>
            </View>
            <View className="bg-green-50 px-3 py-1.5 rounded-xl">
              <Text className="text-green-600 text-xs font-bold">Lifetime Access</Text>
            </View>
          </View>

          <View className="mt-2">
            <Text className="text-gray-900 font-bold text-base mb-2">
              About this course
            </Text>
            <Text className="text-gray-600 leading-relaxed text-sm">
              {course.description}
            </Text>
          </View>

          <View className="mt-6 bg-gray-50 rounded-2xl p-4 border border-gray-100 gap-y-3">
            <View className="flex-row items-center">
              <Ionicons name="videocam-outline" size={20} color="#3b82f6" />
              <Text className="text-gray-700 text-sm ml-3 font-medium">
                12 hours high-quality on-demand video
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="document-text-outline" size={20} color="#3b82f6" />
              <Text className="text-gray-700 text-sm ml-3 font-medium">
                4 articles and downloadable resources
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="ribbon-outline" size={20} color="#3b82f6" />
              <Text className="text-gray-700 text-sm ml-3 font-medium">
                Certificate of completion upon request
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pt-3 pb-7 flex-row items-center justify-between shadow-2xl">
        <TouchableOpacity
          className={`w-14 h-14 rounded-2xl items-center justify-center border ${isBookmarked
            ? "bg-blue-50 border-blue-200"
            : "bg-gray-50 border-gray-200"
            }`}
          onPress={handleBookmarkPress}
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isBookmarked ? "#3b82f6" : "#4b5563"}
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
              <Text className="text-white font-semibold mr-2">Enrolling...</Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-base">
              {isEnrolled ? "Resume Learning" : "Enroll Now"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
