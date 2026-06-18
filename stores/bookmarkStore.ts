import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { reset5BookmarksFlag } from '../services/notificationService';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BookmarkState {
  bookmarkedIds: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarkedIds: [],
      toggleBookmark: (id) =>
        set((state) => {
          const newIds = state.bookmarkedIds.includes(id)
            ? state.bookmarkedIds.filter((b) => b !== id)
            : [...state.bookmarkedIds, id];
          // Reset notification flag if bookmarks fall below 5
          if (newIds.length < 5) {
            // Fire-and-forget async reset
            reset5BookmarksFlag();
          }
          return { bookmarkedIds: newIds };
        }),
      isBookmarked: (id) => get().bookmarkedIds.includes(id),
    }),
    {
      name: 'bookmark-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);