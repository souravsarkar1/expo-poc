import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { memo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { trigger5BookmarksNotification } from "../services/notificationService";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { Course } from "../types/course";

import { useTheme } from "@/app/theme/useTheme";

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const { palette } = useTheme();
  console.log(Number(course.id) % 2);
  const isBookmarked = useBookmarkStore((s) => s.isBookmarked(course.id));
  const toggleBookmark = useBookmarkStore((s) => s.toggleBookmark);
  const [imageError, setImageError] = useState(false);
  const [courceImage, setCourceImage] = useState(() => Number(course.id) % 2 === 0 ? require("../assets/images/learning2.jpg") : require("../assets/images/learning1.jpg"));
  const handleBookmarkPress = () => {
    toggleBookmark(course.id);
    setTimeout(() => {
      const bookmarkedIds = useBookmarkStore.getState().bookmarkedIds;
      if (bookmarkedIds.length >= 5) {
        trigger5BookmarksNotification();
      }
    }, 50);
  };


  return (
    <TouchableOpacity
      style={{
        backgroundColor: palette.surface,
        borderRadius: 20,
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: palette.border,
      }}
      onPress={() => router.push(`/course/${course.id}`)}
      activeOpacity={0.9}
    >
      <View style={{ width: "100%", height: 160, backgroundColor: palette.surface }}>
        {/* {!imageError ? ( */}
        <Image
          source={courceImage}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />

        <Image
          source={require("../assets/images/playbutton.png")}
          style={{ width: 40, height: 40, position: "absolute", top: 60, left: 140 }}
          resizeMode="contain"
        />
        <View
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            backgroundColor: "rgba(255,255,255,0.95)",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              color: "#2563eb",
              fontSize: 11,
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {course.category}
          </Text>
        </View>

        {/* Bookmark */}
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(255,255,255,0.95)",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={(e) => {
            e.stopPropagation();
            handleBookmarkPress();
          }}
          hitSlop={8}
        >
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={16}
            color={isBookmarked ? "#3b82f6" : "#64748b"}
          />
        </TouchableOpacity>

        <View
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            backgroundColor: "rgba(0,0,0,0.65)",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="star" size={11} color="#fbbf24" />
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600", marginLeft: 4 }}>
            {course.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        <Text
          numberOfLines={1}
          style={{ color: palette.textPrimary, fontWeight: "700", fontSize: 16 }}
        >
          {course.title}
        </Text>

        <Text
          numberOfLines={2}
          style={{ color: palette.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 18 }}
        >
          {course.description}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: palette.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
            <Image
              source={{ uri: course.instructor.avatar }}
              style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: palette.border }}
            />
            <Text
              numberOfLines={1}
              style={{ color: palette.textPrimary, fontSize: 12, fontWeight: "500", marginLeft: 8, flex: 1 }}
            >
              {course.instructor.name}
            </Text>
            <Text
              numberOfLines={1}
              style={{ color: palette.textSecondary, fontSize: 12, fontWeight: "500", marginLeft: 8, flex: 1 }}
            >
              {course.instructor.email}
            </Text>
          </View>

          {course.price > 0 && (
            <Text style={{ color: palette.primary, fontWeight: "700", fontSize: 14 }}>
              ${course.price}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(CourseCard);