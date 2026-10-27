# Session 12 — Maps (Simple)

This session is **Session 11 plus one map**. Everything from Session 11 (geolocation, React Query, search, sorting, comments, NativeWind) carries forward unchanged. The only new thing is a small map preview with a single pin on a post's detail screen.

> Want the bigger version, with a Map tab that shows every post? See `session12-maps-full`.

## What's new in this session

| Concept | Where |
|---|---|
| Map preview (single pin) in post detail | `app/(protected)/postDetails/[id].tsx` |
| Platform-specific files | `components/PostMapView.native.tsx` / `PostMapView.tsx` |
| Shared props type for both map files | `utils/mapUtils.ts` |
| Google Maps API key injected at build time | `app.config.js` |

What this session deliberately does **not** do:
- **No Map tab.** There's no full-screen map with every post — only the post you're viewing.
- **No grouping.** `PostMapView` always renders exactly one pin, so there's no need to group posts that share coordinates.
- **Address lookup is unchanged.** It still uses the Google Geocoding API from Session 11 (`reverseGeocode()` in `utils/locationUtils.ts`). The same `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is now also used to draw the map.

---

## Key concept: platform-specific files

`react-native-maps` uses native iOS/Android SDKs and cannot run in a browser. Instead of wrapping every map usage in `Platform.OS === "web"` checks, this session uses **platform-specific file extensions**:

```
components/
  PostMapView.native.tsx   ← loaded on iOS and Android (react-native-maps)
  PostMapView.tsx          ← loaded on web (@react-google-maps/api)
```

Every `import PostMapView from "@/components/PostMapView"` looks the same in the code. Metro picks the right file at bundle time. Both files take the same props, defined once in `utils/mapUtils.ts`:

```ts
export type PostMapViewProps = {
  location: PostLocation;
  zoomDelta?: number; // smaller = more zoomed in
  style?: object;
};
```

```tsx
// PostMapView.native.tsx — real map
import MapView, { Marker } from "react-native-maps";

export default function PostMapView({ location, zoomDelta = 0.01, style }: PostMapViewProps) {
  const region = { ...location, latitudeDelta: zoomDelta, longitudeDelta: zoomDelta };
  return (
    <MapView style={style} initialRegion={region}>
      <Marker coordinate={location} />
    </MapView>
  );
}
```

The web version loads the Google Maps JavaScript script with `useJsApiLoader`, shows a spinner while it loads, and then renders `<GoogleMap><MarkerF /></GoogleMap>`.

---

## Key concept: using the map

The detail screen already had a location card from Session 11. The map is added inside it, and the card is only shown when the post has a location:

```tsx
{post.location && (
  <View style={styles.locationSection}>
    <Text style={styles.locationLabel}>📍 Posted from</Text>
    <PostMapView location={post.location} style={styles.mapPreview} />
    <Text style={styles.locationAddress}>{post.location.address}</Text>
  </View>
)}
```

Old posts without a `location` field show no map. No data migration is needed.

---

## Key concept: app.config.js and the Maps key

Android needs the Google Maps key inside its native config. `app.json` is static and cannot read environment variables, but `app.config.js` can:

```js
// app.config.js
android: {
  config: {
    googleMaps: {
      apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY, // read at build time
    },
  },
},
```

iOS uses Apple Maps by default, so no key is needed there.

---

## Setup

### 1. Environment

Copy `.env.example` → `.env` and fill in:
- Firebase and Google Sign-In values (same as Session 11)
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` — the same key as Session 11, from Google Cloud Console → APIs & Services → Credentials

Enable these APIs in Google Cloud Console:
- **Geocoding API** (address lookup — already enabled in Session 11)
- **Maps SDK for Android** (Android map)
- **Maps JavaScript API** (web map)

> **Security note.** `EXPO_PUBLIC_*` variables ship inside the app bundle and are not secret. Restrict the key to just these three APIs and set a billing alert.

### 2. Install and run

```bash
npm install
npx expo run:android   # or: npx expo run:ios — react-native-maps needs a native build
npx expo start --web   # web uses Google Maps JS, no native build needed
```

---

## What changed from Session 11

| File | Change |
|---|---|
| `components/PostMapView.native.tsx` | New — MapView with a single marker and zoom buttons |
| `components/PostMapView.tsx` | New — Google Maps on web, single marker |
| `utils/mapUtils.ts` | New — shared `PostMapViewProps` type |
| `app/(protected)/postDetails/[id].tsx` | Added the map preview inside the location card |
| `app.config.js` | Injects `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` into the Android config |
| `.env.example` | `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is now also used for the map (Android + web) |
| `package.json` | Added `react-native-maps`, `@react-google-maps/api` |

---

## Testing

See [TESTING_NOTES.md](./TESTING_NOTES.md) for the manual testing checklist.
