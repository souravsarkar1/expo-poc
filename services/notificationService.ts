import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const HAS_SHOWN_5_BOOKMARKS_KEY = 'has_shown_5_bookmarks_notif';

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleInactivityReminder(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'We miss you! 📚',
        body: "It's been 24 hours since you last opened the app. Ready to learn something new today?",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 24 * 60 * 60,
        repeats: false,
      },
    });
  } catch (err) {
    console.error('Failed to schedule inactivity reminder:', err);
  }
}

export async function trigger5BookmarksNotification(): Promise<void> {
  try {
    const hasShown = await AsyncStorage.getItem(HAS_SHOWN_5_BOOKMARKS_KEY);
    if (hasShown === 'true') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bookmarking Champion! 🌟',
        body: 'You have bookmarked 5 or more courses! Check them out in your catalog.',
        sound: true,
      },
      trigger: null,
    });

    await AsyncStorage.setItem(HAS_SHOWN_5_BOOKMARKS_KEY, 'true');
  } catch (err) {
    console.error('Failed to trigger 5 bookmarks notification:', err);
  }
}

export async function reset5BookmarksFlag(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HAS_SHOWN_5_BOOKMARKS_KEY);
  } catch (err) {
    console.error('Failed to reset 5 bookmarks flag:', err);
  }
}
