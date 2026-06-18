import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface EnrollmentState {
  enrolledCourseIds: string[];
  completedCourseIds: string[];
  enroll: (id: string) => void;
  complete: (id: string) => void;
  isEnrolled: (id: string) => boolean;
  isCompleted: (id: string) => boolean;
  reset: () => void;
}

export const useEnrollmentStore = create<EnrollmentState>()(
  persist(
    (set, get) => ({
      enrolledCourseIds: [],
      completedCourseIds: [],
      enroll: (id) =>
        set((state) => ({
          enrolledCourseIds: state.enrolledCourseIds.includes(id)
            ? state.enrolledCourseIds
            : [...state.enrolledCourseIds, id],
        })),
      complete: (id) =>
        set((state) => {
          const enrolled = state.enrolledCourseIds.includes(id)
            ? state.enrolledCourseIds
            : [...state.enrolledCourseIds, id];
          const completed = state.completedCourseIds.includes(id)
            ? state.completedCourseIds
            : [...state.completedCourseIds, id];
          return {
            enrolledCourseIds: enrolled,
            completedCourseIds: completed,
          };
        }),
      isEnrolled: (id) => get().enrolledCourseIds.includes(id),
      isCompleted: (id) => get().completedCourseIds.includes(id),
      reset: () => set({ enrolledCourseIds: [], completedCourseIds: [] }),
    }),
    {
      name: 'enrollment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
