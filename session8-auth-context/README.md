# Session 8 — Firebase Authentication and Auth Context

Session 7's local sign-in (accounts saved in AsyncStorage) is replaced by **Firebase Authentication** with email and password. One **`AuthContext`** shares the signed-in user with every screen, and the root layout acts as a **route guard**: guests can browse the Home tab, and everything else sends them to the new **`/auth`** screen. Firestore and Storage get **security rules** that only let signed-in users read and write.

## Features

### Sign in / Sign up screen (`/auth`)
- A full screen (not a tab) with a **Sign In / Sign Up** toggle.
- **Sign Up** asks for name, email and password. The name becomes the Firebase user's `displayName`.
- Checks the form before calling Firebase: name and email required, password at least 6 characters.
- Firebase errors become friendly messages, for example "Incorrect email or password.", "This email is already registered. Try signing in instead.", or "Too many attempts. Try again later."
- A spinner shows on the button while Firebase is working.
- After a successful sign-in or sign-up, the app goes to Home automatically.

### Staying signed in
- The login survives closing the app: AsyncStorage on iOS/Android, browser storage on the web.
- While Firebase reads the saved login at startup, a full-screen spinner is shown instead of the wrong screen.

### Route guard
- **Guests** (not signed in) can open the **Home** tab.
- Opening a post, the **Profile** tab, or any other screen as a guest redirects to `/auth`.
- A signed-in user who lands on `/auth` is sent to Home.

### Home tab
- The author name comes from the Firebase user (`displayName`, or the email if there is no name).
- The **+** button only appears when you are signed in.
- **Newest first / Oldest first** and **All posts / My posts** buttons work as in Session 7. "My posts" as a guest shows "Sign in to see your own posts".
- Pull to refresh, and image upload to Firebase Storage when creating a post, work as in Session 7.
- Messages appear in a small built-in toast at the top of the screen.

### Profile tab
- Shows an avatar with your first initial, your name, email, the start of your UID, and "Email / Password" as the sign-in method.
- **Sign Out** first goes back to Home and then signs out, so you end up on Home as a guest.

### Post details
- The signed-in user's name is used for likes and comments. Image gallery, likes progress bar, comments with edit/delete, and the Edit and Delete buttons work as in Session 7.

## How to run

1. Use the Firebase project from Sessions 5–7 (Firestore and Storage set up).
2. In the Firebase Console, open **Authentication → Sign-in method** and enable **Email/Password**.
3. Publish the security rules from this folder: paste `firestore.rules` and `storage.rules` into the **Rules** tabs in the console, or run `firebase deploy --only firestore:rules,storage` (the Firebase CLI reads `firebase.json`).
4. Copy the environment file and fill in your Firebase values:
   ```bash
   cd session8-auth-context
   cp .env.example .env
   ```
   The two `EXPO_PUBLIC_GOOGLE_*` entries in `.env.example` are not used by this session's code.
5. Install and start:
   ```bash
   npm install
   npx expo start --clear
   ```
   This folder also contains native `ios/` and `android/` projects, so `npm run ios` / `npm run android` (`expo run:*`) build and run a development build.

### Choosing what guests can see
Guest access is set in three places, and they must agree:

| File | Option 1 — sign in for everything | Option 2 — guests can view Home |
|---|---|---|
| `app/_layout.tsx` | `isProtectedRoute = !onAuthScreen` | also allows the Home screen (**currently active**) |
| `firestore.rules` | `posts`: `allow read: if request.auth != null` (**currently active**) | `allow read: if true` |
| `storage.rules` | `posts/...`: `allow read: if request.auth != null` (**currently active**) | `allow read: if true` |

As committed, the route guard uses Option 2 but the rules use Option 1. A guest can open Home, but loading posts fails ("Could not load posts.") until the two rules files are switched to Option 2 as well. Writes always need a signed-in user, in both options.

## Project structure

```
session8-auth-context/
  firebaseConfig.ts          Firebase app plus `db`, `storage`, and `auth` (AsyncStorage persistence on native)
  context/
    AuthContext.tsx          AuthProvider (one onAuthStateChanged listener) and the useAuth() hook
  api/
    authApi.ts               signInWithEmail, signUpWithEmail, signOutUser, friendly error messages
    postApi.ts               Post CRUD, getAllMyPosts, toggleLike
    commentApi.ts            Comment CRUD in the "comments" collection
    imageApi.ts              uploadImage(): local file → Blob → Firebase Storage → download URL
  app/
    _layout.tsx              RootLayout (AuthProvider) + RootNavigator (spinner and route guard)
    auth.tsx                 Sign in / sign up screen
    postDetails/[id].tsx     Post with image gallery, likes and progress bar, comments
    (tabs)/
      _layout.tsx            Bottom tabs: Home, Profile
      index.tsx              Home: post list, sort, All/My posts, new post with image upload
      profilePage.tsx        Signed-in user's details and Sign Out
  components/
    ImageSelector.tsx        Gallery + camera, thumbnails with rotate / crop / remove
    PostForm.tsx             New Post / Edit Post modal
    CommentsSection.tsx      Comment list with edit/delete for your own comments
    CommentModal.tsx         Popup for adding or editing one comment
    Post.tsx                 Post card with first picture and counts
    Spacer.tsx               Empty View with a given height/width
  utils/
    postData.ts              NewPostData, PostData, CommentData, CommentObject
  firestore.rules            Who can read/write posts and comments
  storage.rules              Who can read/upload post images
  firebase.json              Points the Firebase CLI at the two rules files
  metro.config.js            Turns on package "exports" so Metro resolves Firebase Auth's React Native build
  ios/, android/             Native projects for `expo run:ios` / `expo run:android`
```

## Key files to read

| File | Why it matters |
|---|---|
| `context/AuthContext.tsx` | One `onAuthStateChanged` listener; `user` and `loading` shared through context |
| `app/_layout.tsx` | Why the provider and the guard are two components, and how `useSegments()` drives the redirect |
| `api/authApi.ts` | Sign up = create account + `updateProfile` with the name; error codes → messages |
| `firebaseConfig.ts` | `initializeAuth` with `getReactNativePersistence(AsyncStorage)` on native, `getAuth` on web |
| `firestore.rules`, `storage.rules` | Server-side protection, which the app's route guard can't replace |

## Concepts explained

### `onAuthStateChanged`
Firebase saves the login on the device and tells you who is signed in through a listener:

```ts
onAuthStateChanged(auth, (user) => {
  // user is a Firebase User (uid, email, displayName…) or null
});
```

It runs once at startup (after the saved login is read), again after every sign-in, and again after sign-out. Screens never need to ask "who is signed in?" themselves.

### AuthContext and `useAuth()`
`AuthProvider` starts **one** listener and keeps `user` and `loading` in state. Any screen inside it calls:

```ts
const { user, loading } = useAuth();
```

When the user signs in or out, every screen using `useAuth()` re-renders with the new value. This replaces Session 7's pattern of reading `SESSION_USER` from AsyncStorage in each screen with `useFocusEffect`.

### Why `loading` matters
At startup `user` is `null` until Firebase has read the saved login. That does not mean "signed out". It means "not known yet". `loading` stays `true` until the first callback, and the root layout shows a spinner during that time, so the auth screen doesn't flash on every launch.

### Provider and consumer split in `_layout.tsx`
`useAuth()` only works in a component **below** `AuthProvider`. So `RootLayout` renders the provider, and `RootNavigator` inside it reads `useAuth()` and does the routing:

```tsx
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
```

### The route guard
`useSegments()` returns the current route as an array. `segments[0]` is `"auth"` on the auth screen, `"(tabs)"` in the tabs, and `"postDetails"` on a post. On the Home tab, `segments[1]` is `undefined`.

| Signed in? | Where you are | Result |
|---|---|---|
| No | `/auth` or Home | Stay |
| No | Any other screen | `router.replace("/auth")` |
| Yes | `/auth` | `router.replace("/")` |
| Yes | Anywhere else | Stay |

The effect re-runs whenever `user` or `segments` change, so signing in, signing out, or tapping a post as a guest is handled in one place.

### Security rules
The route guard only hides screens in the app. Anyone with your Firebase config could still call Firestore directly. The rules files protect the data on the server: `request.auth != null` means "the request comes from a signed-in Firebase user". Posts have no owner UID yet (the author is a display name), so any signed-in user may edit or delete any post.

### Persistence on React Native
On the web, Firebase Auth remembers the login in browser storage by default. On iOS/Android it has to be told to use AsyncStorage:

```ts
initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
```

`getReactNativePersistence` only exists in Firebase's React Native build. `firebaseConfig.ts` loads it with `require()`, and `metro.config.js` and `tsconfig.json` are set up so Metro and TypeScript find that build.

## What changed from Session 7

| File | Change |
|---|---|
| `context/AuthContext.tsx` | **New**: AuthProvider and `useAuth()` |
| `api/authApi.ts` | **New**: Firebase sign in, sign up, sign out, and error messages |
| `app/auth.tsx` | **New**: sign in / sign up screen, replacing the "Sign in" tab |
| `app/(tabs)/authenticationPage.tsx` | **Removed** |
| `utils/userData.ts` | **Removed**: local accounts, `SESSION_USER`, and "clear all data" are gone |
| `app/_layout.tsx` | Wraps the app in `AuthProvider`, shows a spinner while auth loads, guards routes, adds the `auth` screen. The `react-native-toast-message` `<Toast />` host is removed |
| `app/(tabs)/_layout.tsx` | Only two tabs: Home and Profile |
| `app/(tabs)/index.tsx` | Author from `useAuth()` instead of AsyncStorage; **+** only when signed in; sort/filter changes reload through `useFocusEffect`; built-in toast instead of `react-native-toast-message` |
| `app/(tabs)/profilePage.tsx` | Rewritten: shows the Firebase user and signs out with `signOutUser()`. The "not signed in" view and "Clear all local data" button are removed |
| `app/postDetails/[id].tsx` | Current user from `useAuth()` instead of reading AsyncStorage on focus |
| `components/PostForm.tsx` | Author hint now says "from your account" |
| `firebaseConfig.ts` | Exports `auth`, with AsyncStorage persistence on native |
| `firestore.rules`, `storage.rules`, `firebase.json` | **New**: security rules requiring sign-in |
| `metro.config.js` | **New**: resolves Firebase Auth's React Native build |
| `tsconfig.json` | Path for `@firebase/auth` React Native types |
| `app.json` | Session 8 name, slug and scheme; iOS `bundleIdentifier` and Android `package`; camera permission text for `expo-image-picker` |
| `package.json` | `ios` / `android` scripts now use `expo run:*` |
| `ios/`, `android/` | **New**: native projects for development builds |
| `.gitignore` | Expo's generated ignore rules added (signing keys, `*.orig.*`, npm/yarn logs) |
  