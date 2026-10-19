# Session 10 — NativeWind Styling and Protected Routes

## What's new in this session

| Concept | Where |
|---|---|
| NativeWind (Tailwind CSS for React Native) | `app/(protected)/(tabs)/index.tsx`, `profilePage.tsx` |
| `(protected)` route group guard | `app/(protected)/_layout.tsx` |
| Simplified root layout | `app/_layout.tsx` |
| `global.css` + Tailwind config | `global.css`, `tailwind.config.js` |
| NativeWind metro + babel config | `metro.config.js`, `babel.config.js` |
| Geolocation (coordinates + reverse geocoding, no maps) | `utils/locationUtils.ts`, `components/PostForm.tsx` |

---

## Key concept: NativeWind

NativeWind brings Tailwind CSS utility classes to React Native via the `className` prop.

```tsx
// Before (Session 9) — StyleSheet
<View style={styles.container}>
  <Text style={styles.title}>Hello</Text>
</View>

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  title: { fontSize: 24, fontWeight: "bold", color: "#111" },
});

// After (Session 10) — NativeWind
<View className="flex-1 bg-gray-100">
  <Text className="text-2xl font-bold text-gray-900">Hello</Text>
</View>
```

`postDetails/[id].tsx` intentionally keeps StyleSheet so you can compare the two approaches side by side.

### Common NativeWind classes used in this session

| StyleSheet | NativeWind className |
|---|---|
| `flex: 1` | `flex-1` |
| `backgroundColor: "#f2f2f7"` | `bg-gray-100` |
| `alignItems: "center"` | `items-center` |
| `justifyContent: "center"` | `justify-center` |
| `padding: 16` | `p-4` |
| `borderRadius: 12` | `rounded-xl` |
| `fontSize: 14, color: "gray"` | `text-sm text-gray-500` |
| `fontWeight: "bold"` | `font-bold` |
| `marginBottom: 8` | `mb-2` |

---

## Key concept: (protected) route group

In Session 9, the root `_layout.tsx` watched `useSegments` + `useAuth()` to decide when to redirect. The logic was imperative (inside a `useEffect`).

Session 10 uses a **route group layout** instead. All screens that require login live inside `app/(protected)/`. The group's `_layout.tsx` makes the auth decision declaratively:

```tsx
// app/(protected)/_layout.tsx
export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) return <ActivityIndicator />;
  if (!user) return <Redirect href="/auth" />;  // ← declarative redirect

  return <Stack>...</Stack>;
}
```

The root `_layout.tsx` shrinks to just `AuthProvider` + a `Stack`:

```tsx
// app/_layout.tsx (Session 10)
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="redirect" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
```

To add a new protected screen: put the file inside `app/(protected)/` and it is automatically guarded.
To add a new public screen: put the file at the `app/` root level.

---

## Key concept: geolocation (no maps)

Posts can optionally be tagged with the location they were created from —
coordinates plus a human-readable `address` like "Oslo, Norway". This
session only covers reading the device's location and turning it into
text; showing locations on a map is **Session 11**, not here.

```ts
// utils/postData.ts
export interface PostLocation {
  latitude: number;
  longitude: number;
  address?: string;
}
```

```tsx
// utils/locationUtils.ts
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== "granted") throw new LocationPermissionDeniedError();

const position = await Location.getCurrentPositionAsync({});

// Reverse geocoding uses the Google Geocoding HTTP API, not expo-location's
// on-device reverseGeocodeAsync — see the note below.
const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
const data = await (await fetch(url)).json();
```

**Why the HTTP Geocoding API instead of `reverseGeocodeAsync`:**
`expo-location`'s on-device reverse geocoding depends on the Android
`Geocoder` having a backend geocoding service available, which isn't
guaranteed on every Android device (it's commonly missing on emulators
without Google Play Services) and behaves differently from iOS. Calling the
Google Geocoding API directly gives consistent results across iOS, Android,
and web, and matches the approach used later in Session 12.
`getCurrentLocation()` in `utils/locationUtils.ts` still falls back to
showing raw coordinates (e.g. `"59.9139, 10.7522"`) if the API key is
missing or the request fails — this never blocks attaching a location.

In `components/PostForm.tsx`, tapping **"Use my location"** requests
permission, fetches the location, and shows the resulting address with a
**Remove** option before the post is submitted. The address (if any) is
shown on the post card and on the post detail screen.

**Requires `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`** in `.env`, with the
"Geocoding API" enabled in Google Cloud Console — see `.env.example`. No
`MapView` is rendered in this session (that's Session 11), so the Maps SDKs
themselves aren't needed here, only the Geocoding API.

---

## NativeWind setup (how it was configured)

### 1. Install

```bash
npm install nativewind@^4.1.23
npm install --save-dev tailwindcss@^3.4.17
```

### 2. tailwind.config.js

```js
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: { extend: {} },
  plugins: [],
};
```

### 3. global.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. babel.config.js

```js
presets: [
  ["babel-preset-expo", { jsxImportSource: "nativewind" }],
  "nativewind/babel",
],
```

### 5. metro.config.js

```js
const { withNativeWind } = require("nativewind/metro");
module.exports = withNativeWind(config, { input: "./global.css" });
```

### 6. Import global.css in root layout

```tsx
// app/_layout.tsx — first line
import "../global.css";
```

### 7. nativewind-env.d.ts (TypeScript support)

```ts
/// <reference types="nativewind/types" />
```

---

## Setup

1. Copy `.env.example` → `.env` and fill in values (Firebase + Google Sign-In
   are the same as Sessions 8–9; `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is new in
   this session, for the geolocation feature's reverse geocoding)
2. `npm install`
3. `npx expo start --web` or `npx expo run:ios`

---

## What changed from Session 9

- `app/_layout.tsx` — no auth logic; just `AuthProvider` + `Stack`; imports `global.css`
- `app/(protected)/_layout.tsx` — new; declarative auth guard with `<Redirect />`
- `app/(protected)/(tabs)/index.tsx` — full NativeWind restyle (no StyleSheet)
- `app/(protected)/(tabs)/profilePage.tsx` — full NativeWind restyle
- `app/(protected)/postDetails/[id].tsx` — kept with StyleSheet for comparison
- `app/auth.tsx` — unchanged (StyleSheet kept — complex form, good contrast)
- `global.css`, `tailwind.config.js`, `metro.config.js`, `babel.config.js`, `nativewind-env.d.ts` — NativeWind setup files
- `utils/locationUtils.ts` — new; wraps `expo-location` permission + position + reverse geocoding
- `utils/postData.ts` — `PostData` gets an optional `location` field
- `components/PostForm.tsx` — new "Use my location" toggle (new posts only)
- `components/Post.tsx`, `app/(protected)/postDetails/[id].tsx` — show the location address when a post has one
- `app.json` — `expo-location` plugin, `NSLocationWhenInUseUsageDescription` (iOS), `ACCESS_FINE_LOCATION`/`ACCESS_COARSE_LOCATION` (Android)
