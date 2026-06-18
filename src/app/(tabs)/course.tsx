import { Ionicons } from "@expo/vector-icons";
import { LegendList } from "@legendapp/list/react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CourseCard from "../../../components/CourseCard";
import { fetchCourses } from "../../../services/courseApi";
import { Course } from "../../../types/course";
const CourseScreen = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 5 * 60 * 1000,
  });

  const allCourses = useMemo(() => {
    return data?.pages.flatMap((page) => page.courses) ?? [];
  }, [data]);
  const filteredCourses = useMemo(() => {
    if (!search.trim()) return allCourses;

    const query = search.toLowerCase();

    return allCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.instructor.name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
    );
  }, [allCourses, search]);

  const renderItem = useCallback(
    ({ item }: { item: Course }) => <CourseCard course={item} />,
    []
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#32353aff" />
        <Text className="text-gray-500 mt-3">Loading courses...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Ionicons name="cloud-offline-outline" size={48} color="#9ca3af" />
        <Text className="text-gray-700 font-semibold mt-3 text-center">
          Couldn't load courses
        </Text>
        <Text className="text-gray-400 text-sm mt-1 text-center font-medium">
          Check your connection and try again
        </Text>
        <Text
          className="mt-6 px-4 py-2 bg-blue-500 rounded-xl text-white font-semibold shadow-sm active:bg-blue-600"
          onPress={() => refetch()}
        >
          Retry Fetching
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-1 pb-3 bg-white border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900 mb-3">Courses</Text>

        <View className="flex-row items-center bg-gray-100 rounded-xl px-3">
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 py-3 px-2 text-gray-900"
            placeholder="Search courses, instructors..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color="#9ca3af"
              onPress={() => setSearch("")}
            />
          )}
        </View>
      </View>

      {/* List */}
      <LegendList
        data={filteredCourses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 24 }}
        estimatedItemSize={130}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={["#3b82f6"]}
            tintColor="#3b82f6"
          />
        }
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="search-outline" size={40} color="#d1d5db" />
            <Text className="text-gray-400 mt-2 font-medium">No courses found</Text>
          </View>
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text className="text-gray-500 mt-2 font-medium">Loading more...</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default CourseScreen;