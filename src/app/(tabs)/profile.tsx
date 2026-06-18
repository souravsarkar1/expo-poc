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
import { useAuthStore } from "../../../stores/authStore";
import { useBookmarkStore } from "../../../stores/bookmarkStore";
import { useEnrollmentStore } from "../../../stores/enrollmentStore";

const Profile = () => {
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
      Alert.alert("Permission needed", "Please allow access to your photos");
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
      Alert.alert("Upload failed", err.message || "Could not update avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="bg-blue-500 pt-16 pb-20 px-6 rounded-b-[40px]">
        <Text className="text-white text-2xl font-bold text-center">Profile</Text>
      </View>

      <View className="items-center -mt-16">
        <View className="relative">
          {user?.avatar?.url ? (
            <Image
              source={{ uri: user.avatar.url }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
          ) : (
            <View className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 items-center justify-center">
              <Ionicons name="person" size={56} color="#9ca3af" />
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

        <Text className="text-xl font-bold text-gray-900 mt-4">
          {user?.username || "Guest User"}
        </Text>
        <Text className="text-gray-500 mt-1">{user?.email || "—"}</Text>
      </View>

      <View className="px-6 mt-8">
        <Text className="text-lg font-bold text-gray-900 mb-4">Your Learning</Text>

        <View className="flex-row gap-3 mb-3">
          <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mb-2">
              <Ionicons name="book-outline" size={20} color="#3b82f6" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{stats.enrolled}</Text>
            <Text className="text-gray-500 text-sm">Enrolled</Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center mb-2">
              <Ionicons name="checkmark-circle-outline" size={20} color="#22c55e" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{stats.completed}</Text>
            <Text className="text-gray-500 text-sm">Completed</Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mb-2">
              <Ionicons name="time-outline" size={20} color="#f97316" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{stats.inProgress}</Text>
            <Text className="text-gray-500 text-sm">In Progress</Text>
          </View>

          <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mb-2">
              <Ionicons name="bookmark-outline" size={20} color="#a855f7" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{stats.bookmarks}</Text>
            <Text className="text-gray-500 text-sm">Bookmarked</Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-700 font-medium">Overall Progress</Text>
            <Text className="text-blue-500 font-bold">{progressPercent}%</Text>
          </View>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>
      </View>

      <View className="px-6 mb-10">
        <Text className="text-lg font-bold text-gray-900 mb-4">Account</Text>

        <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 mb-3">
          <View className="flex-row items-center gap-3">
            <Ionicons name="person-outline" size={20} color="#6b7280" />
            <Text className="text-gray-800 font-medium">Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 mb-3">
          <View className="flex-row items-center gap-3">
            <Ionicons name="settings-outline" size={20} color="#6b7280" />
            <Text className="text-gray-800 font-medium">Preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center bg-red-50 rounded-2xl p-4 border border-red-100 mt-2"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="text-red-500 font-semibold ml-2">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;