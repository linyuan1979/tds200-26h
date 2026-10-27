# Session 12 (Maps Simple) — Manual Testing Guide

No automated tests are included in this session. Test the features manually using a physical device or simulator.

---

## Setup

```bash
cp .env.example .env   # fill in Firebase + Google Sign-In keys + Google Maps API key
npm install
npx expo run:android   # or run:ios — maps need a native build
```

---

## 1. Auth guard

| Step | Expected |
|---|---|
| Open the app while signed out | Redirected to login screen |
| Sign in with email/password | Lands on Home tab |
| Reload the app while signed in | Opens directly on Home tab (no login flash) |
| Sign out from Profile tab | Redirected back to login screen |

---

## 2. Location permission

| Step | Expected |
|---|---|
| Tap + to open New Post form | Form opens, Location section visible with two buttons |
| Tap "Use my location" | OS permission dialog appears |
| Deny permission | Error message: "Location permission denied. Enable it in your device settings." |
| Grant permission | Spinner → a row with 📍 and the resolved address replaces the buttons |
| Tap Remove | Location row cleared, both buttons reappear |

> **Simulator note:** iOS Simulator and Android Emulator can simulate GPS coordinates.
> In the simulator: Features → Location → Custom Location. Or skip this entirely and use
> "Enter coordinates" instead (see below).

---

## 3. Entering coordinates by hand

| Step | Expected |
|---|---|
| Tap + to open New Post form | Form opens, Location section visible |
| Tap "Enter coordinates" | Latitude/longitude inputs appear — no permission dialog |
| Enter `59.9139` / `10.7522`, tap Set location | A row with 📍 and an address (or the coordinates) appears |
| Enter `200` / `0`, tap Set location | Error: "Enter a valid latitude (-90 to 90) and longitude (-180 to 180)." |

---

## 4. Creating a post with location

| Step | Expected |
|---|---|
| Fill in title, tap "Use my location", tap Post | Post saved to Firestore with `location` field |
| View the post in the Home feed | Post card shows normally |
| Open the post detail | A "📍 Posted from" card shows a map with a pin, the address and coordinates |
| Check Firestore console | Document has `location: { latitude: ..., longitude: ... }` |

---

## 5. Creating a post without location

| Step | Expected |
|---|---|
| Fill in title, do NOT tap location, tap Post | Post saved without `location` field |
| Open the post detail | No location card shown |

Old posts from earlier sessions that have no location field should also display without a location card — confirm this with at least one existing post.

---

## 6. Post detail — location map

| Step | Expected |
|---|---|
| Open a post that has a location | Card shows a 180px map with a single pin, plus the address and coordinates |
| Tap + / − on the map | Map zooms in / out around the pin |
| Open a post without a location | No location card visible |
| Coordinates in the card | Match the values stored in Firestore |
| Open on web (`npx expo start --web`) a post that has a location | Google Maps loads with a single pin at the post's coordinates |
| Remove `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` and open on web | Error text: "Could not load Google Maps…" instead of a crash |

This session has no Map tab — the only map is the single-pin preview on a post's detail screen. See `session12-maps-full` for the Map tab.

---

## 7. Privacy reminder

The location stored is the GPS coordinate plus the human-readable address resolved once via reverse geocoding (`utils/locationUtils.ts`). Verify that:
- The coordinates and address shown to the user match what's stored in Firestore
- No additional location data (altitude, accuracy, timestamp) is stored
- If the Geocoding API request fails (or the key is missing), the address falls back to raw coordinates instead of failing

---

## 8. Regression — all Session 11 features still work

| Feature | Check |
|---|---|
| Create post (no location) | Works |
| Edit post | Works |
| Delete post | Works (Alert on native, window.confirm on web) |
| Like / unlike | Works |
| Add / edit / delete comment | Works |
| Image upload | Works |
| Profile page + sign out | Works |
| (protected) guard | Works |

---

## 9. Sort button

| Step | Expected |
|---|---|
| On Home, note the feed order | Newest posts first (default) |
| Tap the Sort button | Label switches to "Oldest first", list reorders oldest-first |
| Tap it again | Label switches back to "Newest first", list returns to newest-first |
| Open Profile tab | Your own posts, with their own independent Sort button next to "My Posts" |
| Tap Sort on Profile | Only the Profile list reorders — Home's sort choice is unaffected |

---

## 10. React Query (from Session 11)

| Step | Expected |
|---|---|
| Type in the Home search bar | List filters instantly, no network request (check dev tools/network tab) |
| Clear the search text | Full list returns |
| Search for text that matches nothing | "No results." empty state shown |
| Open Profile tab | Spinner briefly, then "My Posts" section lists your own posts (Firestore `where` query via `useMyPostsQuery`) |
| Open a post, go back to Home, reopen the same post | Second open renders instantly from cache while it refetches in the background |
