# Session 8 — Firebase Authentication and Auth Context

The local, AsyncStorage-based sign in from Session 7 is replaced by real **Firebase Authentication** with email and password. One **`AuthContext`** listens to Firebase and shares the signed-in user with every screen, and the root layout acts as an **auth guard**: nobody gets into the app without signing in. Firestore and Storage **security rules** now require a signed-in user too.

## Features

### Sign in / Sign up screen (`/auth`)
- A **Sign In / Sign Up** toggle at the top. Switching mode clears the form.
- **Sign Up** asks for name, email, and password (at least 6 characters). The name is saved as the Firebase user's `displayName`.
- **Sign In** asks for email and password.
- The button shows a spinner while Firebase is working.
- Errors appear as a toast with a friendly message instead of the raw Firebase code, for example "Incorrect email or password.", "This email is already registered. Try signing in instead.", or "Too many attempts. Try again later.".

### Auth guard
- On launch, a spinner is shown until Firebase has read the saved session.
- Not signed in → the app goes to `/auth`. Signed in and on `/auth` → the app goes to Home.
- The login is remembered between launches (AsyncStorage on iOS/Android, browser storage on web), so you only sign in once.
- Signing out anywhere sends you back to `/auth` automatically.

### Home tab
- The author name for new posts comes from the signed-in Firebase user (`displayName`, or the email if there is no name). The post form shows "from your account".
- **Newest first / Oldest first** and **All posts / My posts** buttons, pull-to-refresh, and image uploads work as in Session 7.

### Profile tab
- A round avatar with the first letter of your name, your name, email, the start of your UID, and the sign-in method (Email / Password).
- A red **Sign Out** button.

### Post details
- Likes and comments are stored under the signed-in user's name from `useAuth()`.
- Image gallery, likes progress bar, comments, Edit, and Delete work as in Session 7.

### Tabs
- Only **Home** and **Profile**. The Session 7 "Sign in" tab is gone, because signing in now happens on the guarded `/auth` screen.

## How to run

1. Use the Firebase project from Session 7 (Firestore and Storage).
2. In the Firebase Console, open **Authentication → Sign-in method** and enable **Email/Password**.
3. Deploy the security rules in this folder (or paste them into the console under Firestore → Rules and Storage → Rules):
   ```bash
   firebase deploy --only firestore:rules,storage
   ```
4. Copy the environment file and fill in the `EXPO_PUBLIC_FIREBASE_*` values (the Google client ID lines are not used in this session):
   ```bash
   cd session8-auth-context
   cp .env.example .env
   ```
5. Install and start:
   ```bash
   npm install
   npx expo start --clear
   ```

## Project structure

```
session8-auth-context/
  firebaseConfig.ts          Exports db, storage, and auth (AsyncStorage persistence on native)
  metro.config.js            Enables package "exports" so Metro loads Firebase's React Native build
  tsconfig.json              Points TypeScript at Firebase Auth's React Native types
  firebase.json              Tells the Firebase CLI where the rules files are
  firestore.rules            posts and comments: signed-in users only
  storage.rules              posts/ images: signed-in users only
  context/
    AuthContext.tsx          AuthProvider (one onAuthStateChanged listener) + useAuth() hook
  api/
    authApi.ts               signInWithEmail, signUpWithEmail, signOutUser, friendly error messages
    postApi.ts               Post CRUD, "my posts", and toggleLike
    commentApi.ts            Comment CRUD in the "comments" collection
    imageApi.ts              uploadImage(): local file → Blob → Firebase Storage → download URL
  app/
    _layout.tsx              RootLayout (provides AuthProvider) + RootNavigator (auth guard)
    auth.tsx                 Sign in / sign up screen
    postDetails/[id].tsx     Post with images, likes and progress bar, comments
    (tabs)/
      _layout.tsx            Bottom tabs: Home, Profile
      index.tsx              Home; author name from useAuth()
      profilePage.tsx        Signed-in user and Sign Out
  components/                ImageSelector, PostForm, Post, CommentsSection, CommentModal, Spacer
  utils/
    postData.ts              NewPostData, PostData, CommentData, CommentObject
  examples/
    context-counter/         React Context with a simple counter, before using it for auth
    auth-state-observer/     Logs every time onAuthStateChanged fires
  assignment/
    ASSIGNMENT.md            Author-only delete button on a post
    ASSIGNMENT2.md           A "My Posts" tab
    solution/                Solution code and notes for both assignments
```

## Key files to read

| File | Why it matters |
|---|---|
| `context/AuthContext.tsx` | One `onAuthStateChanged` listener; `user` and `loading` shared through `useAuth()` |
| `app/_layout.tsx` | The auth guard: `useSegments()` + `router.replace()` decide between `/auth` and Home |
| `api/authApi.ts` | Every Firebase Auth call, plus error code → friendly message |
| `app/auth.tsx` | Sign in / sign up form with validation and error toasts |
| `firebaseConfig.ts` | `initializeAuth` with `getReactNativePersistence(AsyncStorage)` on native, `getAuth` on web |
| `firestore.rules`, `storage.rules` | `request.auth != null`: the server-side half of the auth guard |

## Concepts explained

### `onAuthStateChanged`
A live listener, not a one-time call. It fires once on startup with the saved session (or `null`), then again after every sign in and sign out. It returns an `unsubscribe` function, which `AuthProvider` returns from `useEffect` to clean up.

### Why `AuthContext`?
Instead of every screen setting up its own listener, `AuthProvider` sets up **one** and publishes `{ user, loading }`. Any screen calls `useAuth()` and re-renders automatically when the user signs in or out.

The four steps are the same as in `examples/context-counter`: define the type → `createContext` → a Provider that holds the state → `useContext` in a custom hook.

### Why `loading`?
Right after launch, Firebase hasn't read the saved session yet, so `user` is `null` even for someone who is signed in. `loading` stays `true` until the first `onAuthStateChanged` call, and the layout shows a spinner instead of flashing the sign-in screen.

### Why `RootLayout` and `RootNavigator` are split
`useAuth()` only works in a component **inside** `<AuthProvider>`. `RootLayout` renders the provider, and `RootNavigator` (its child) reads `useAuth()` and does the redirects.

### The redirect logic
| `user` | On `/auth`? | Action |
|---|---|---|
| `null` | no | `router.replace("/auth")` |
| `null` | yes | stay |
| signed in | no | stay |
| signed in | yes | `router.replace("/")` |

`app/_layout.tsx` also contains a commented-out **Option 2** that lets guests view the Home tab. To use it, switch the matching commented lines in `app/(tabs)/index.tsx`, `firestore.rules`, and `storage.rules` as well.

### Sign out order
`profilePage.tsx` calls `router.replace("/")` **before** `signOutUser()`. Signing out first would make the guard redirect from the protected Profile screen before the function could navigate itself.

### Security rules
The route guard only hides screens in the app. The rules make the **server** refuse reads and writes from anyone who isn't signed in (`request.auth != null`). Posts still store the author as a display name, not a UID, so any signed-in user can edit or delete any post; there are no per-user ownership checks yet.

### Firebase Auth in React Native
Firebase ships a separate React Native build of `firebase/auth` that includes `getReactNativePersistence`. `metro.config.js` turns on package `exports` so Metro picks that build, and the `@firebase/auth` path in `tsconfig.json` points TypeScript at the matching types, so the import type-checks.
