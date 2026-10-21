# Session 11 — Geolocation and React Query

In this session you attach a location to a post and fetch data with React Query.

## What's new in this session

| Concept | Where |
|---|---|
| Location permission + GPS read | `utils/locationUtils.ts` — `getCurrentLocation()` |
| Reverse geocoding (coordinates → address) | `utils/locationUtils.ts` — `reverseGeocode()` |
| Typed-in coordinates (no GPS needed) | `utils/locationUtils.ts` — `getMockLocation()` |
| Optional location on posts | `utils/postData.ts` — `PostLocation` |
| "Use my location" / "Enter coordinates" buttons | `components/PostForm.tsx` |
| Location shown on posts | `components/Post.tsx`, `app/(protected)/postDetails/[id].tsx` |
| Dynamic app config | `app.config.js` (replaces `app.json`) |
| React Query | `app/_layout.tsx`, `hooks/usePostsQuery.ts` |
| Remote query with `where()` | `api/queryApi.ts` — `getMyPosts()` |
| Local search | `components/SearchBar.tsx`, `app/(protected)/(tabs)/index.tsx` |
| Sort button (newest / oldest) | `components/SortButton.tsx` |
| "My Posts" on Profile | `app/(protected)/(tabs)/profilePage.tsx` |

There is no map in this session. A post's location is shown as text: an address and the coordinates. Maps come in Session 12.

---

## Key concept: location permission

Apps must ask the user before reading GPS. Expo has two permission levels:

```ts
// Foreground: location available while the app is open
await Location.requestForegroundPermissionsAsync();

// Background: location available even when the app is closed
// — needs extra justification in App Store review
await Location.requestBackgroundPermissionsAsync();
```

This app asks for **foreground only**, which is all it needs to attach a location to a post.

```ts
// utils/locationUtils.ts
export async function getCurrentLocation(): Promise<PostLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new LocationPermissionDeniedError();
  }

  const position = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = position.coords;
  const address = await reverseGeocode(latitude, longitude);

  return { latitude, longitude, address };
}
```

`PostForm.tsx` gives you two ways to attach a location to a new post:

- **📍 Use my location:** calls `getCurrentLocation()`. It needs permission and a GPS fix, and it can fail.
- **🧪 Enter coordinates:** you type a latitude and longitude, and it calls `getMockLocation()`. There's no permission dialog and no GPS, which is handy on a simulator.

### Permission setup in `app.config.js`

Reading GPS needs permission setup in the native app. This applies on simulators and emulators too. One plugin entry does all of it:

```js
// app.config.js → plugins
[
  "expo-location",
  {
    locationWhenInUsePermission:
      "Allow $(PRODUCT_NAME) to access your location to attach it to posts.",
  },
],
```

- **iOS:** sets `NSLocationWhenInUseUsageDescription`, the text shown in the permission dialog. Without it, iOS refuses the location request.
- **Android:** adds the `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION` permissions.

| Feature | Needs this setup? |
|---|---|
| GPS ("Use my location") | ✅ yes |
| Geocoding Method 1 (Google API) | ❌ no, it's just a `fetch` |
| Geocoding Method 2 (`reverseGeocodeAsync`) | iOS: no · Android: yes, permission must be granted |

Notes:
- Changes to `app.config.js` only take effect after a rebuild: `npx expo prebuild --clean`, then `npx expo run:ios` / `npx expo run:android`. Restarting Metro is not enough.
- Expo Go ignores this config and uses its own permissions. An app can work in Expo Go and still fail in a development build if the setup is missing.
- To test GPS on a simulator, set a location first. On the iOS Simulator: **Features → Location → Custom Location**. On the Android emulator: **⋯ → Location**.

---

## Key concept: reverse geocoding (two methods)

GPS gives you numbers like `59.9139, 10.7522`. Reverse geocoding turns them into an address people can read. `utils/locationUtils.ts` contains two versions of `reverseGeocode()`. Method 1 is active and Method 2 is commented out.

### Method 1 (active): Google Geocoding API

```ts
const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const url =
  `https://maps.googleapis.com/maps/api/geocode/json` +
  `?latlng=${latitude},${longitude}&key=${apiKey}`;
const data = await (await fetch(url)).json();
// data.results[0].formatted_address → "Karl Johans gate 1, 0154 Oslo, Norway"
```

This needs `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env`, with the **Geocoding API** enabled in Google Cloud Console. If the key is missing or the request fails, the function returns the coordinates as text instead. The post is saved either way.

### Method 2 (commented out): the device's own geocoder

```ts
const results = await Location.reverseGeocodeAsync({ latitude, longitude });
const place = results[0];
// place.street, place.city, place.country → "Karl Johans gate, Oslo, Norway"
```

This needs no API key. It asks the phone's built-in geocoder: Apple's on iOS, and `android.location.Geocoder` on Android.

To try it, move the `/*` and `*/` from Method 2 to Method 1 in `utils/locationUtils.ts`. Only one `reverseGeocode()` can be active at a time.

### Comparing the two

| Platform | Method 1: Google API | Method 2: `reverseGeocodeAsync` |
|---|---|---|
| iOS (simulator or device) | ✅ | ✅ |
| Android with Google Play Services | ✅ | ✅ usually |
| Android without Play Services / plain emulator | ✅ | ❌ fails or returns nothing |
| Web (`npx expo start` → `w`) | ✅ | ❌ always throws |
| API key | required | not needed |

**Why Method 1 is the default.** On Android, `reverseGeocodeAsync()` relies only on the native `android.location.Geocoder`. That geocoder needs a geocoding service on the device, which is often missing on emulators and devices without Google Play Services. Older versions of `expo-location` fell back to Google Maps when the native geocoder failed. That fallback was removed in `expo-location` 9.0.0. The optional Google-backed geocoding (`useGoogleMaps`) was removed in 15.3.0 (SDK 49). Calling the Google API directly gives the same result on iOS, Android, and web.

**About the API key.** Any `EXPO_PUBLIC_` variable is built into the app, so anyone with the app can read it. In Google Cloud Console, restrict the key to the **Geocoding API** only and set a budget alert.

---

## Key concept: optional location on posts

`location` is an optional field. Older posts without it still work.

```ts
// utils/postData.ts
export interface PostLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface NewPostData {
  // ...title, description, hashtags, author...
  location?: PostLocation; // optional
}
```

When a post has no `location`, the location line on the post card and the location section on the detail screen are not shown.

---

## Key concept: React Query

With `useState` + `useEffect`, you write the loading, error, and refetch logic by hand every time. `useQuery` gives you all of that, plus caching:

```ts
// hooks/usePostsQuery.ts
export function usePostQuery(id: string) {
  return useQuery({
    queryKey: ["post", id], // cache key, changes when id changes
    queryFn: () => getPostById(id), // the fetch function
    enabled: !!id, // don't run until we have an id
  });
}
```

- **`queryKey`**: identifies the cached data. When the key changes, React Query fetches again.
- **`queryFn`**: the async function that loads the data.
- **`enabled`**: set to `false` to skip the query until its inputs are ready.
- **`staleTime`**: how long (in ms) data counts as fresh before React Query refetches in the background.

One `QueryClient` is created in `app/_layout.tsx` and provided to the whole app with `<QueryClientProvider>`.

The post detail screen uses `usePostQuery(id)`. When you go back to a post you've already opened, it shows instantly from the cache.

---

## Key concept: local search vs. remote query

| | Local search (Home) | Remote query (Profile) |
|---|---|---|
| Where | `app/(protected)/(tabs)/index.tsx` | `app/(protected)/(tabs)/profilePage.tsx` |
| How | `.filter()` on posts already in memory | Firestore `where("authorId", "==", uid)` |
| Network request | none, so it updates as you type | yes, and the server returns only matching posts |

```ts
// api/queryApi.ts
const q = query(
  collection(db, "posts"),
  where("authorId", "==", userId)
);
```

`getMyPosts()` sorts the results in code, not with `orderBy()`. Using `where()` on one field together with `orderBy()` on another needs a Firestore composite index. Sorting in code avoids that.

The **Sort** button (`components/SortButton.tsx`) switches between "Newest first" and "Oldest first". On Home, the order is passed to Firestore's `orderBy("createdAt", ...)`. On Profile, it's part of the `useMyPostsQuery` key, so changing it fetches again.

---

## Setup

### 1. Environment

Copy `.env.example` to `.env` and fill in:
- the Firebase and Google Sign-In values (same as Sessions 8–10)
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, with the **Geocoding API** enabled. This one is optional. Without it, posts show coordinates instead of an address.

### 2. Install and run

```bash
npm install
npx expo start          # then press i (iOS), a (Android) or w (web)
# or a native build:
npx expo run:ios
npx expo run:android
```

---

## What changed from Session 10

| File | Change |
|---|---|
| `app.config.js` | New, replaces `app.json`. Adds the `expo-location` plugin |
| `.env.example` | Added `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` |
| `package.json` | Added `expo-location`, `@tanstack/react-query` |
| `utils/postData.ts` | Added `PostLocation`, `location`, and `createdAt` |
| `utils/locationUtils.ts` | New: GPS, reverse geocoding (two methods), typed-in coordinates |
| `components/PostForm.tsx` | Added "Use my location" / "Enter coordinates" (new posts only) |
| `components/Post.tsx` | Shows the address when a post has a location |
| `app/(protected)/postDetails/[id].tsx` | Location section, and loads the post with `usePostQuery` |
| `app/_layout.tsx` | Wrapped the app in `QueryClientProvider` |
| `hooks/usePostsQuery.ts` | New: `usePostQuery`, `useAllPostsQuery`, `useMyPostsQuery` |
| `api/queryApi.ts` | New: `getMyPosts()` with `where("authorId", "==", uid)` |
| `components/SearchBar.tsx` | New: search input |
| `components/SortButton.tsx` | New: one button that toggles newest / oldest |
| `app/(protected)/(tabs)/index.tsx` | Search + Sort button. The "All / My posts" toggle moved to Profile |
| `app/(protected)/(tabs)/profilePage.tsx` | New "My Posts" list using `useMyPostsQuery` |

---

## Try it

1. Create a post and tap **📍 Use my location**. Allow the permission. An address appears.
2. Create a post with **🧪 Enter coordinates** `59.9139`, `10.7522`. It should show an Oslo address.
3. Remove `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` from `.env` and restart with `npx expo start -c`. Posts now show coordinates instead of an address.
4. Switch to Method 2 and run on web. The address falls back to coordinates. Run on iOS and the address works.
5. Type in the search bar on Home. The list filters without loading.
6. Open Profile. Only your own posts are listed. Tap **Sort** to change the order.
