# Session 9 — Auth Context, Protected Routes, Firebase Rules

## What's new in this session

| Concept | Where |
|---|---|
| React Context API | `context/AuthContext.tsx` |
| `useAuth()` custom hook | `context/AuthContext.tsx` |
| `AuthProvider` wrapping the app | `app/_layout.tsx` |
| `(protected)` route group with declarative guard | `app/(protected)/_layout.tsx` |
| `authorId` stored on posts/comments | `utils/postData.ts`, `api/postApi.ts`, `api/commentApi.ts` |
| Client-side auth guards in API layer | `api/postApi.ts`, `api/commentApi.ts` |
| Ownership-based edit/delete | `app/(protected)/postDetails/[id].tsx` |
| Firebase security rules | see below |

---

## Project structure

```
app/
  _layout.tsx                    Root layout — AuthProvider + top-level screens only
  auth.tsx                       Sign in / sign up screen
  redirect.tsx                   Google OAuth redirect handler
  (protected)/
    _layout.tsx                  Auth guard — redirects to /auth if not signed in
    (tabs)/
      _layout.tsx                Tab bar
      index.tsx                  Home feed
      profilePage.tsx            Profile + sign out
    postDetails/
      [id].tsx                   Post detail, edit, delete, comments
context/
  AuthContext.tsx                AuthProvider + useAuth() hook
```

---

## Key concept: Auth Context

In Session 8 every screen read `auth.currentUser` directly from Firebase. This works,
but `auth.currentUser` is a snapshot — it does not cause a re-render when auth state
changes. A sign-out would not update the UI until the next render cycle.

With Auth Context the user is stored in React state and shared through the component
tree. Any component calls `useAuth()` and gets a reactive `user` and `loading` value
that re-renders automatically when auth changes.

```tsx
// Session 8 — static snapshot, no reactivity
import { auth } from "@/firebaseConfig";
const user = auth.currentUser!;

// Session 9 — reactive, re-renders on sign-in / sign-out
import { useAuth } from "@/context/AuthContext";
const { user } = useAuth();
```

---

## Key concept: `(protected)` route group

Session 8 used an **imperative** guard in `_layout.tsx`:

```tsx
// Session 8 — imperative
function RootNavigator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const onAuthScreen = segments[0] === "auth";
    if (!user && !onAuthScreen) router.replace("/auth");
    else if (user && onAuthScreen) router.replace("/");
  }, [user, loading, segments]);
  ...
}
```

Session 9 replaces this with a **declarative** guard using a route group:

### How it works

Expo Router treats any folder name wrapped in parentheses as a **route group**. Route groups organise files without adding a URL segment.

```
app/(protected)/postDetails/[id].tsx  →  URL: /postDetails/[id]
app/(protected)/(tabs)/index.tsx      →  URL: /
```

The `_layout.tsx` inside the group becomes the entry point for every screen in that group. This is where the guard lives:

```tsx
// app/(protected)/_layout.tsx
export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator />;   // wait for Firebase to read the session
  }

  if (!user) {
    return <Redirect href="/auth" />;  // not signed in → send to auth screen
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="postDetails/[id]" options={{ headerBackTitle: "Back" }} />
    </Stack>
  );
}
```

### Why `<Redirect />` is better than `router.replace()`

| | Session 8 imperative | Session 9 declarative |
|---|---|---|
| How | `useEffect` + `router.replace()` | `<Redirect href="/auth" />` |
| When it runs | After render, inside an effect | During render |
| Risk | Brief flash of protected content before effect fires | No flash — screen never renders |
| `useSegments` needed | Yes — to know which screen you're on | No |
| Readable | Requires understanding effect timing | Self-documenting |

### `app/_layout.tsx` is now clean

Because the guard moved into `(protected)/_layout.tsx`, the root layout has no auth logic at all:

```tsx
// app/_layout.tsx
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

The `(protected)` screen name matches the `(protected)` folder. Every screen inside the folder inherits the guard automatically — no per-screen check needed.

---

## Key concept: authorId vs author

Posts now store two identity fields:

| Field | Type | Purpose |
|---|---|---|
| `author` | string | Display name shown in the UI |
| `authorId` | string | Firebase UID used for ownership checks and security rules |

The UID never changes even if the user updates their display name. Security rules and
ownership comparisons always use `authorId`, never `author`.

---

## Firebase Security Rules

Security rules run on Firebase's servers. Even if someone bypasses your app code
entirely, the rules enforce who can read and write data.

### Firestore Rules

Copy this into Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /posts/{postId} {
      // Any signed-in user can read posts
      allow read: if request.auth != null;

      // Any signed-in user can create a post
      // request.auth.uid must match the authorId being written
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.authorId;

      // Only the post owner can edit the content fields
      // Any signed-in user can update the likes array (like/unlike)
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.authorId ||
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes', 'comments'])
      );

      // Only the post owner can delete
      allow delete: if request.auth != null
                    && request.auth.uid == resource.data.authorId;
    }

    match /comments/{commentId} {
      allow read: if request.auth != null;

      // Any signed-in user can create a comment
      // authorId in the comment must match the authenticated user
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.authorId;

      // Only the comment author can delete their comment
      allow delete: if request.auth != null
                    && request.auth.uid == resource.data.authorId;
    }
  }
}
```

### Firebase Storage Rules

Copy this into Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Any signed-in user can read and write
      // For production: scope writes to posts/{userId}/{allPaths=**}
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Setup

1. Copy `.env.example` → `.env` and fill in values (same as Session 8)
2. Apply Firestore and Storage rules above in Firebase Console
3. `npm install`
4. `npx expo start --web` or `npx expo run:ios`

---

## What changed from Session 8

| File | Change |
|---|---|
| `context/AuthContext.tsx` | New — all auth state lives here |
| `app/_layout.tsx` | Now only wraps in `AuthProvider` + declares top-level screens; no auth logic |
| `app/(protected)/_layout.tsx` | New — declarative auth guard with `<Redirect />` |
| `app/(protected)/(tabs)/index.tsx` | `useAuth()` instead of `auth.currentUser` |
| `app/(protected)/(tabs)/profilePage.tsx` | `useAuth()` instead of `auth.currentUser` |
| `app/(protected)/postDetails/[id].tsx` | `useAuth()`, uid-based ownership, Edit/Delete only for post owner |
| `utils/postData.ts` | `PostData.authorId` added; `CommentData.authorName` added |
| `api/postApi.ts` | `createPost` sets `authorId` from `auth.currentUser.uid`; throws if not signed in |
| `api/commentApi.ts` | `addComment` sets `authorId` and `authorName` from auth |
