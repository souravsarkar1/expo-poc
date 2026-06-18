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
import { appConstant } from "../../../constants/appText";
import { fetchCourses } from "../../../services/courseApi";
import { Course } from "../../../types/course";
import { useTheme } from "../theme/useTheme";

const CourseScreen = () => {
  const { palette } = useTheme();
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
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: palette.background }}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text className="mt-3" style={{ color: palette.textSecondary }}>{appConstant.LOADING_COURSES}</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: palette.background }}>
        <Ionicons name="cloud-offline-outline" size={48} color={palette.textSecondary} />
        <Text className="font-semibold mt-3 text-center" style={{ color: palette.textPrimary }}>
          {appConstant.COULDN_T_LOAD_COURSES}
        </Text>
        <Text className="text-sm mt-1 text-center font-medium" style={{ color: palette.textSecondary }}>
          {appConstant.COULDN_T_LOAD_COURSES_MESSAGE}
        </Text>
        <Text
          className="mt-6 px-4 py-2 bg-blue-500 rounded-xl text-white font-semibold shadow-sm active:bg-blue-600"
          onPress={() => refetch()}
        >
          {appConstant.RETRY_FETCHING}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.background }}>
      <View className="px-6 pt-1 pb-3 border-b" style={{ backgroundColor: palette.background, borderBottomColor: palette.border }}>
        <Text className="text-2xl font-bold mb-3" style={{ color: palette.textPrimary }}>{appConstant.COURSES}</Text>

        <View className="flex-row items-center rounded-xl px-3" style={{ backgroundColor: palette.surface }}>
          <Ionicons name="search-outline" size={18} color={palette.textSecondary} />
          <TextInput
            className="flex-1 py-3 px-2"
            style={{ color: palette.textPrimary }}
            placeholder={appConstant.SEARCH_COURSES}
            placeholderTextColor={palette.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 && (
            <Ionicons
              name="close-circle"
              size={18}
              color={palette.textSecondary}
              onPress={() => setSearch("")}
            />
          )}
        </View>
      </View>

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
            colors={[palette.primary]}
            tintColor={palette.primary}
          />
        }
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="search-outline" size={40} color={palette.textSecondary} />
            <Text className="mt-2 font-medium" style={{ color: palette.textSecondary }}>{appConstant.NO_COURSES_FOUND}</Text>
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
              <ActivityIndicator size="small" color={palette.primary} />
              <Text className="mt-2 font-medium" style={{ color: palette.textSecondary }}>{appConstant.LOADING_MORE}</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default CourseScreen;