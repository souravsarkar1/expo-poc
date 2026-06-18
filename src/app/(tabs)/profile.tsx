import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { appConstant } from "../../../constants/appText";
import { useAuthStore } from "../../../stores/authStore";
import { useBookmarkStore } from "../../../stores/bookmarkStore";
import { useEnrollmentStore } from "../../../stores/enrollmentStore";
import { useTheme } from "../theme/useTheme";

const Profile = () => {
  const { theme, palette, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateAvatar = useAuthStore((s) => s.updateAvatar);

  const enrolledCourseIds = useEnrollmentStore((s) => s.enrolledCourseIds);
  const completedCourseIds = useEnrollmentStore((s) => s.completedCourseIds);
  const bookmarkedIds = useBookmarkStore((s) => s.bookmarkedIds);

  const [uploading, setUploading] = useState(false);

  const stats = {
    enrolled: enrolledCourseIds.length,
    completed: completedCourseIds.length,
    inProgress: Math.max(0, enrolledCourseIds.length - completedCourseIds.length),
    bookmarks: bookmarkedIds.length,
  };

  const progressPercent =
    stats.enrolled > 0 ? Math.round((stats.completed / stats.enrolled) * 100) : 0;

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(appConstant.PERMISSION_NEEDED + appConstant.PLEASE_ALLOW_ACCESS_TO_YOUR_PHOTOS);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;

    setUploading(true);
    try {
      await updateAvatar(imageUri);
    } catch (err: any) {
      Alert.alert(appConstant.UPLOAD_FAILED, err.message || appConstant.COULD_N_T_UPDATE_AVATAR);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(appConstant.LOG_OUT, appConstant.ARE_YOU_SURE_YOU_WANT_TO_LOG_OUT, [
      { text: appConstant.CANCEL, style: "cancel" },
      { text: appConstant.LOG_OUT, style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: palette.background }} showsVerticalScrollIndicator={false}>
      <View className="bg-blue-500 pt-16 pb-20 px-6 rounded-b-[40px]">
        <Text className="text-white text-2xl font-bold text-center">{appConstant.PROFILE}</Text>
      </View>

      <View className="items-center -mt-16">
        <View className="relative">
          {user?.avatar?.url ? (
            <Image
              source={{ uri: user.avatar.url }}
              className="w-32 h-32 rounded-full border-4"
              style={{ borderColor: palette.background }}
            />
          ) : (
            <View className="w-32 h-32 rounded-full border-4 items-center justify-center" style={{ borderColor: palette.background, backgroundColor: palette.surface }}>
              <Ionicons name="person" size={56} color={palette.textSecondary} />
            </View>
          )}

          <TouchableOpacity
            className="absolute bottom-0 right-0 bg-blue-500 w-10 h-10 rounded-full items-center justify-center border-2 border-white"
            onPress={handlePickImage}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="camera" size={18} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <Text className="text-xl font-bold mt-4" style={{ color: palette.textPrimary }}>
          {user?.username || "Guest User"}
        </Text>
        <Text className="mt-1" style={{ color: palette.textSecondary }}>{user?.email || "—"}</Text>
      </View>

      <View className="px-6 mt-8">
        <Text className="text-lg font-bold mb-4" style={{ color: palette.textPrimary }}>Your Learning</Text>

        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 rounded-2xl p-4 border shadow-sm" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
            <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mb-2">
              <Ionicons name="book-outline" size={20} color="#3b82f6" />
            </View>
            <Text className="text-2xl font-bold" style={{ color: palette.textPrimary }}>{stats.enrolled}</Text>
            <Text className="text-sm" style={{ color: palette.textSecondary }}>Enrolled</Text>
          </View>

          <View className="flex-1 rounded-2xl p-4 border shadow-sm" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
            <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center mb-2">
              <Ionicons name="checkmark-circle-outline" size={20} color="#22c55e" />
            </View>
            <Text className="text-2xl font-bold" style={{ color: palette.textPrimary }}>{stats.completed}</Text>
            <Text className="text-sm" style={{ color: palette.textSecondary }}>{appConstant.COMPLETED}</Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 rounded-2xl p-4 border shadow-sm" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
            <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mb-2">
              <Ionicons name="time-outline" size={20} color="#f97316" />
            </View>
            <Text className="text-2xl font-bold" style={{ color: palette.textPrimary }}>{stats.inProgress}</Text>
            <Text className="text-sm" style={{ color: palette.textSecondary }}>{appConstant.IN_PROGRESS}</Text>
          </View>

          <View className="flex-1 rounded-2xl p-4 border shadow-sm" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
            <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mb-2">
              <Ionicons name="bookmark-outline" size={20} color="#a855f7" />
            </View>
            <Text className="text-2xl font-bold" style={{ color: palette.textPrimary }}>{stats.bookmarks}</Text>
            <Text className="text-sm" style={{ color: palette.textSecondary }}>{appConstant.BOOKMARKED}</Text>
          </View>
        </View>

        <View className="rounded-2xl p-4 border shadow-sm mb-6" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-medium" style={{ color: palette.textPrimary }}>{appConstant.OVERALL_PROGRESS}</Text>
            <Text className="font-bold" style={{ color: palette.primary }}>{progressPercent}%</Text>
          </View>
          <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.border }}>
            <View
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>
      </View>

      <View className="px-6 mb-10">
        <Text className="text-lg font-bold mb-4" style={{ color: palette.textPrimary }}>{appConstant.ACCOUNT}</Text>

        <TouchableOpacity className="flex-row items-center justify-between rounded-2xl p-4 border mb-3" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <View className="flex-row items-center gap-3">
            <Ionicons name="person-outline" size={20} color={palette.textSecondary} />
            <Text className="font-medium" style={{ color: palette.textPrimary }}>{appConstant.EDIT_PROFILE}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
        </TouchableOpacity>

        {/* Theme Toggle row */}
        <TouchableOpacity
          className="flex-row items-center justify-between rounded-2xl p-4 border mb-3"
          style={{ backgroundColor: palette.surface, borderColor: palette.border }}
          onPress={toggleTheme}
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name={theme === 'dark' ? "moon" : "sunny"} size={20} color={theme === 'dark' ? '#fbbf24' : palette.textSecondary} />
            <Text className="font-medium" style={{ color: palette.textPrimary }}>{appConstant.DARK_MODE}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-semibold" style={{ color: palette.primary }}>
              {theme === 'dark' ? 'On' : 'Off'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between rounded-2xl p-4 border mb-3" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
          <View className="flex-row items-center gap-3">
            <Ionicons name="settings-outline" size={20} color={palette.textSecondary} />
            <Text className="font-medium" style={{ color: palette.textPrimary }}>{appConstant.PREFERENCES}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center rounded-2xl p-4 border mt-2"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
            borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2'
          }}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="text-red-500 font-semibold ml-2">{appConstant.LOG_OUT}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;