# House Ed Tech - Expo Mobile Application

Welcome to the documentation for **House Ed Tech**, a universal mobile application built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev/). This document provides a step-by-step walkthrough of the entire application architecture, its components, flow logic, and the technical decisions behind them.

---

## 🛠 Technology Stack & Core Rationale

The application employs a modern React Native development stack chosen to maximize responsiveness, maintainability, and user experience:

* **Framework**: [Expo SDK](https://docs.expo.dev/) (Managed workflow, leveraging File-based Routing with `expo-router`).
* **State Management**:
  * [Zustand](https://github.com/pmndrs/zustand) for lightweight, predictable global state (Auth, Bookmarks, and Enrollment).
  * [React Query (TanStack Query)](https://tanstack.com/query/latest) for server-state caching, automatic synchronization, and pagination management.
* **Styling**: [Tailwind CSS (NativeWind)](https://www.nativewind.dev/) for high-velocity, responsive utility-first layout styling.
* **List Virtualization**: [@legendapp/list](https://legendapp.com/open-source/list/) for highly optimized, high-performance course lists with minimal memory overhead.
* **Secure Storage**: `expo-secure-store` for cryptographic storage of authentication tokens.
* **Biometrics**: `expo-local-authentication` for secure FaceID/Fingerprint logins.
* **Webview Bridge**: `react-native-webview` for sandbox course players, utilizing dynamic JavaScript injection and event messaging.
* Local Notificatin : expo-notifications use for local notification

---

## 📂 Project Architecture

```
house_ed_tech/
├── assets/                    # Static image/media assets & HTML content constants
├── components/                # Shared reusable UI elements & ErrorBoundary wrapper
├── constants/                 # Standardized system constants (e.g., text, storage keys)
├── services/                  # Business logic services (e.g., API calls, notifications)
├── src/
│   └── app/                   # Expo Router file-based screens and layout
│       ├── (tabs)/            # Tab navigation layout (Course, Profile)
│       ├── course/            # Dynamic course detail & WebView routes
│       ├── theme/             # Light/Dark context engine & color palettes
│       └── _layout.tsx        # Application root, guard router, and providers
└── stores/                    # Local persistent stores (Zustand)
```

---

## 🧭 Step-by-Step Flow & Screen Walkthrough

### Step 1: App Bootstrapping & Route Guards

* **Files**:
  * [src/app/index.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/index.tsx)
  * [src/app/_layout.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/_layout.tsx)
* **How it is used**:
  * [index.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/index.tsx) redirects standard root traffic directly to the tabbed course directory: `/(tabs)/course`.
  * [_layout.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/_layout.tsx) is the entry boundary. It wraps the app with `ThemeProvider` (Theme System) and `QueryClientProvider` (React Query).
  * **Guards**: An effect monitors `isAuthenticated` and `isLoading` statuses. If a user is not authenticated and is outside the `/login` or `/register` screens, they are immediately redirected to `/login`. If they are authenticated and try to access login/register, they are redirected to `/`.
  * **Network Detection**: Listens to `NetInfo`. If the device goes offline, a custom warning banner is dynamically rendered at the top.
  * **Notifications**: Requests local notification permission on startup. If granted, schedules a background inactivity reminder.
* **Why we use this**:
  * Centralizing routing controls prevents rendering partially-loaded protected components.
  * Listening to network changes globally enables robust offline handling immediately instead of waiting for API requests to fail.

---

### Step 2: Authentication (Login & Registration)

* **Files**:
  * [src/app/login.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/login.tsx)
  * [src/app/register.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/register.tsx)
  * [stores/authStore.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/stores/authStore.ts)
* **How it is used**:
  * **Login Flow**: Collects user email/password. Offers a password visibility toggle. On successful manual login, it invokes `login()` in [authStore.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/stores/authStore.ts) and saves credentials to local storage via `AsyncStorage` to enable future biometrics.
  * **Biometrics Integration**: Upon screen load, if saved credentials exist in local storage and biometric hardware is available (`expo-local-authentication`), it triggers a FaceID/Fingerprint prompt. On confirmation, it bypasses manual inputs and performs token-based login. If biometric login fails (e.g. invalid server credentials or unlisted profile), the handler catches the exception and redirects the user to the signup screen.
  * **Registration Flow**: Gathers username, email, and password. Calls `register()` in the auth store. On success, stores the registered credentials in local storage and redirects the user back to `/login` to sign in.
  * **Auth Store**:
    * Coordinates HTTP requests to the FreeAPI backend service (`https://api.freeapi.app/api/v1`).
    * Manages access tokens and refresh tokens. Access tokens are stored securely in keychain/keystore via `expo-secure-store`.
    * Includes a token-refresh mechanism: during application startup (`loadStoredAuth`), it verifies the access token. If it has expired (yielding a 401), it attempts to refresh tokens automatically. If successful, it fetches the user profile; if not, it triggers a clean logout.
* **Why we use this**:
  * `expo-secure-store` encrypts authentication keys at rest, ensuring protection against storage introspection attacks.
  * Biometrics provide a frictionless login experience, while the automatic fallback to registration guarantees users can create accounts immediately if credentials are missing or expired.

---

### Step 3: Course Listing & Infinite Scroll Catalog

* **Files**:
  * [src/app/(tabs)/course.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/(tabs)/course.tsx)
  * [services/courseApi.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/services/courseApi.ts)
  * [components/CourseCard.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/components/CourseCard.tsx)
* **How it is used**:
  * **Performance-Optimized Listing**: Instead of a traditional `FlatList`, the screen uses `@legendapp/list`'s `LegendList`. This list uses advanced virtualization to render massive feeds with extremely fast scroll tracking.
  * **Data Aggregation**: Since there is no native endpoint for courses in the public API, [courseApi.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/services/courseApi.ts) fetches public random products (`/public/randomproducts`) and public random users (`/public/randomusers`) concurrently using `Promise.all`. It pairs them based on index, treating "products" as courses and "users" as course instructors.
  * **Pagination & Refresh**: React Query's `useInfiniteQuery` handles course loading. The list triggers `fetchNextPage()` when scrolling reaches the bottom. Pull-to-refresh is linked directly to Query Refetch.
  * **Search**: A search bar filters loaded courses on the client side by course title, category, or instructor name.
  * **Cards**: Individual cards ([CourseCard.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/components/CourseCard.tsx)) display the paired instructor info, thumbnails (randomized between two local assets `learning1.jpg` and `learning2.jpg` using the course ID mod 2), pricing, and a bookmark toggle.
* **Why we use this**:
  * `LegendList` drastically decreases the CPU rendering cycle time and frame drops compared to standard list components.
  * React Query caches list states, preventing redundant API calls when navigating back and forth.

---

### Step 4: Single Course Details Screen

* **Files**:
  * [src/app/course/[id].tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/course/%5Bid%5D.tsx)
* **How it is used**:
  * **Cache Retrieval**: Obtains the dynamic course ID parameter `id`. To avoid a redundant network request, it accesses React Query's cache (`queryClient.getQueryData(['courses'])`) to fetch the target course details instantly.
  * **Video Integration**: Renders a YouTube video trailer component using `react-native-youtube-iframe`. The dynamic video ID is resolved by a helper matching course title and category keywords.
  * **Bookmark Logic**: Updates `useBookmarkStore`. If the user reaches 5 bookmarked courses, it triggers a local push notification congratulating them.
  * **Enrollment Sequence**:
    * If the user is **not enrolled**, they press "Enroll Now". This starts a mock loading sequence (800ms spinner) before saving the enrollment status in `useEnrollmentStore`. A confirmation popup offers to transition them directly to the course player.
    * If the user **is enrolled**, the main CTA turns green and displays "Resume Learning", which bypasses loading and takes the user immediately to the Webview player.
* **Why we use this**:
  * Directly querying cache data removes the "loading spinner" delay when a user clicks a course card, providing an instantaneous interface transition.
  * Simulating enrollment logic with feedback (spinner and prompts) mimics live production database updates.

---

### Step 5: Webview Course Player & API Header Verification

* **Files**:
  * [src/app/course/[id]/webview.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/course/%5Bid%5D/webview.tsx)
  * [assets/constants/htmlContent.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/assets/constants/htmlContent.ts)
* **How it is used**:
  * Renders a tabbed interface containing two views:
    1. **Course Player Tab**: Loads a local, styled HTML layout ([htmlContent.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/assets/constants/htmlContent.ts)) mimicking a full LMS interface (including interactive tabs, progress bars, and instructor info).
    2. **Debug Headers Tab**: Loads an external endpoint (`https://httpbin.org/headers`) and passes dynamic header keys.
  * **Custom Headers Demonstration**:
    * When loading the debugger tab, the webview passes the user's current backend access token:
      ```javascript
      const customHeaders = {
        Authorization: `Bearer ${accessToken}`,
        "X-Course-Id": id,
        "X-Device-OS": Platform.OS,
      };
      ```
    * This proves that headers are transmitted securely to the server side inside the webview.
  * **Native & Web Bridge (JavaScript Injection)**:
    * **App to Web**: Injects setup scripts into the player:
      ```javascript
      window.courseId = "${id}";
      setupCourseData(${JSON.stringify({ ...course, isCompleted })});
      ```

      This populates the HTML view with data from the React Native state.
    * **Web to App**: Inside the player HTML, when the user clicks the "Mark as Completed" button, it runs:
      ```javascript
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'COMPLETE_COURSE',
        courseId: window.courseId
      }));
      ```

      The Native app catches this event in the `onMessage` handler of the `WebView` component, triggers the native store action `complete(courseId)` to mark the course completed in state, and injects Javascript back into the WebView calling `setCompletedUI()` to update the page UI elements in real time.
* **Why we use this**:
  * Using custom HTTP headers inside a webview ensures that premium content stays locked behind authentication, and servers can verify user permissions.
  * Bidirectional scripting allows web-based content and native mobile components to stay synchronized (e.g., updating native progress trackers when a user completes a lesson online).

---

## 💾 State Management & Local Stores

The application uses **Zustand** coupled with local persistence (`AsyncStorage`) to store app states across launches:

### 1. Authentication Store

* **File**: [stores/authStore.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/stores/authStore.ts)
* **Role**: Tracks currently logged-in user profile structures, active authentication tokens, and performs token refresh checks. Saves credentials securely.

### 2. Bookmark Store

* **File**: [stores/bookmarkStore.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/stores/bookmarkStore.ts)
* **Role**: Manages an array of bookmarked course IDs. Provides instantaneous evaluation (`isBookmarked`) and toggling methods. Integrates with the notification triggers when reaching a 5-item threshold.

### 3. Enrollment Store

* **File**: [stores/enrollmentStore.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/stores/enrollmentStore.ts)
* **Role**: Tracks lists of course IDs enrolled or marked as completed by the student.

---

## 🎨 Global Theme Engine

* **Files**:
  * [src/app/theme/ThemeContext.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/theme/ThemeContext.tsx)
  * [src/app/theme/palette.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/theme/palette.ts)
  * [src/app/theme/useTheme.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/theme/useTheme.ts)
* **How it works**:
  * `ThemeProvider` reads saved preferences from `AsyncStorage` on mount.
  * If no preference exists, it checks system preferences via `Appearance.getColorScheme()`.
  * Exposes `theme` (`'light' | 'dark'`), `palette` (colors matching [palette.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/theme/palette.ts)), and `toggleTheme()`.
  * Palette definitions are structured as follows:
    ```typescript
    export const lightPalette = {
      background: '#FFFFFF',
      surface: '#F3F4F6',
      primary: '#3B82F6',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
    };
    ```
* **Why we use this**:
  * Provides centralized colors that update immediately when the theme is toggled anywhere in the app (e.g., from the settings screen in [src/app/(tabs)/profile.tsx](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/src/app/(tabs)/profile.tsx)).

---

## 🔔 Push Notification Engine

* **File**: [services/notificationService.ts](file:///Users/abcom/Documents/sourav/react-native/house_ed_tech/services/notificationService.ts)
* **How it works**:
  * Initializes `expo-notifications` setup handlers allowing notifications to display in the foreground.
  * Offers three core routines:
    1. `requestNotificationPermissions()`: Asks for permissions.
    2. `scheduleInactivityReminder()`: Schedules a time-interval reminder if the user remains inactive.
       * *Note*: The reminder trigger interval is set using `24 * 60 * 60` seconds to prompt users to return in a shorter, more engaging cycle.
    3. `trigger5BookmarksNotification()`: Displays a local congratulations notification when the user reaches 5 bookmarks, saving a tracking flag in local storage to prevent duplicate alerts.
* **Why we use this**:
  * Local notifications increase user retention by prompting them to return, without requiring a complex backend infrastructure.
