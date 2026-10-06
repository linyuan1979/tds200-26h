# Session 8 — Firebase Authentication

## What you will learn

- How to sign up and sign in with email and password using Firebase Auth
- How `onAuthStateChanged` works and why Firebase persists sessions automatically
- How to create an `AuthContext` so any component can read the current user
- How `_layout.tsx` enforces sign-in before the user can enter the app
- How to sign out and have the app route back to the auth screen automatically
- How to show friendly error messages for auth failures

## How to run

```bash
cd session8-auth
cp .env.example .env   # fill in your Firebase project values
npm install
npx expo start --clear
```

---

## Core concept: how auth state works

Firebase Auth stores the signed-in session on the device (AsyncStorage on iOS/Android, localStorage on web). When the app reopens, Firebase reads that stored session and tells you who is logged in — you never need to ask the user to sign in again on every launch.

The way you listen to this is `onAuthStateChanged`:

```ts
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";

onAuthStateChanged(auth, (user) => {
  if (user) {
    // user is a Firebase User object — has .uid, .email, .displayName, etc.
  } else {
    // null — nobody is signed in
  }
});
```

This callback fires:
1. **Once on startup** — with the persisted session (or `null` if no session)
2. **After sign-in** — with the new User object
3. **After sign-out** — with `null`

You do not need to call it manually. It is a live listener.

---

## AuthContext — sharing auth state across the app

Without a context, every screen would need to call `onAuthStateChanged` separately. That means multiple listeners, multiple re-renders, and screens falling out of sync.

`AuthContext` solves this by setting up **one listener** and making the result available everywhere via a hook.

### `context/AuthContext.tsx`

```ts
// 1. Define the shape of the data the context holds
type AuthContextType = {
  user: User | null;
  loading: boolean;
};

// 2. Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// 3. AuthProvider sets up the listener and publishes the result
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);   // Firebase has finished reading the stored session
    });
    return unsubscribe;    // stop listening when the component unmounts
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. useAuth is the custom hook any component calls to read user + loading
export function useAuth() {
  return useContext(AuthContext);
}
```

### Why `loading` matters

When the app first opens, Firebase has not yet read the stored session from disk. During this brief moment, `user` is `null` — but that does **not** mean the user is logged out. It just means we do not know yet.

Without `loading`, the app would flash the auth screen on every launch and then immediately redirect to the home screen once Firebase confirms the session. The `loading` flag lets us show a spinner instead while we wait.

```
App opens → loading: true  → show spinner
             ↓
Firebase reads session → loading: false, user: { ... }  → go to home
                      → loading: false, user: null       → go to /auth
```

### Using `useAuth()` in a screen

```ts
import { useAuth } from "@/context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();
  const authorName = user?.displayName ?? user?.email ?? "Anonymous";
  // ...
}
```

No need to import `auth` from `firebaseConfig` or call `auth.currentUser` directly. The context keeps the value reactive — if the user signs out, every component that calls `useAuth()` re-renders automatically.

---

## `_layout.tsx` — enforcing sign-in

This is where the auth guard lives. There are two components here, split deliberately:

```
RootLayout        ← wraps everything in AuthProvider
  └── RootNavigator   ← calls useAuth() and handles routing
```

### Why the split?

`useAuth()` calls `useContext(AuthContext)`. A context hook only works inside a component that is a **child** of the matching Provider. If `RootLayout` both provided and consumed the context in the same component, React would throw an error.

The fix: `RootLayout` provides, `RootNavigator` consumes.

```tsx
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />   {/* ← can safely call useAuth() */}
    </AuthProvider>
  );
}
```

### How `RootNavigator` guards the app

```tsx
function RootNavigator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;   // wait until Firebase has read the session

    const onAuthScreen = segments[0] === "auth";

    if (!user && !onAuthScreen) {
      router.replace("/auth");    // not signed in → go to auth screen
    } else if (user && onAuthScreen) {
      router.replace("/");        // signed in but on auth screen → go home
    }
  }, [user, loading, segments]);

  if (loading) {
    return <ActivityIndicator />;  // show spinner while Firebase loads
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="postDetails/[id]" options={{ headerBackTitle: "Back" }} />
    </Stack>
  );
}
```

### `useSegments` — what screen am I on?

`useSegments()` returns the current URL path as an array of segments.

| Current screen | `segments[0]` |
|---|---|
| Home tab (`/`) | `"(tabs)"` |
| Auth screen (`/auth`) | `"auth"` |
| Post detail (`/postDetails/123`) | `"postDetails"` |

This lets the guard check `segments[0] === "auth"` without hardcoding the full path.

### The redirect logic

| `user` | `onAuthScreen` | Action |
|---|---|---|
| `null` | `false` | Push to `/auth` — user must sign in |
| `null` | `true` | Do nothing — already on auth screen |
| `User` | `false` | Do nothing — already inside the app |
| `User` | `true` | Push to `/` — user just signed in |

When the user signs out, `onAuthStateChanged` fires with `null`, `useAuth()` updates `user`, and the `useEffect` in `RootNavigator` runs again — automatically redirecting to `/auth`.

---

## Auth API — `api/authApi.ts`

All Firebase Auth calls live here so screens stay clean:

```ts
// Sign up — creates account and sets display name in one call
export async function signUpWithEmail(email, password, name) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: name });
  return user;
}

// Sign in — Firebase restores session automatically next launch
export async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Sign out — onAuthStateChanged fires, _layout.tsx routes to /auth
export async function signOutUser() {
  return signOut(auth);
}
```

---

## Project structure

```
session8-auth-context/
  context/
    AuthContext.tsx       New — AuthProvider + useAuth() hook
  app/
    _layout.tsx           RootLayout (provides) + RootNavigator (guards)
    auth.tsx              Sign in / sign up screen
    postDetails/[id].tsx  Image gallery, likes progress bar, editable comments
    (tabs)/
      _layout.tsx
      index.tsx           Uses useAuth() for author name, sort + My Posts / All Posts filter
      profilePage.tsx     Shows signed-in user + sign-out button
  api/
    authApi.ts            signInWithEmail, signUpWithEmail, signOutUser
    commentApi.ts         addComment, getCommentsByIds, updateComment, deleteComment
    imageApi.ts           uploadImage (fails loudly on an unreadable file)
    postApi.ts            createPost, getAllPosts, subscribeToPosts, updatePost, toggleLike
  components/
    ImageSelector.tsx     Pick/take/crop images, drag to reorder
    CommentModal.tsx      Add/edit comment popup
    CommentsSection.tsx   Comment list with edit/delete
    Post.tsx
    PostForm.tsx          Integrates ImageSelector
    Spacer.tsx
```

## What changed from Session 7

Session 7's local sign-up/sign-in (`utils/userData.ts`, `app/(tabs)/authenticationPage.tsx`) is a teaching stand-in for real auth and is **not** carried into this session — it is fully replaced by Firebase Authentication.

| File | Change |
|---|---|
| `context/AuthContext.tsx` | New — one auth listener shared across the app |
| `app/_layout.tsx` | Replaced the local session read with `AuthProvider` + `RootNavigator` guard, which redirects to `/auth` whenever nobody is signed in |
| `app/auth.tsx` | New — email/password sign-in and sign-up screen, replaces `authenticationPage.tsx` |
| `app/(tabs)/_layout.tsx` | Removed the "Sign in" tab — signing in now happens on the guarded `/auth` screen, not a tab |
| `app/(tabs)/index.tsx` | Local `SESSION_USER` lookup → `useAuth()`; sort/filter buttons kept, now filtering the live `subscribeToPosts` stream instead of a manual fetch |
| `app/(tabs)/profilePage.tsx` | Local `SESSION_USER` lookup → `useAuth()`, sign-out calls `signOutUser()` instead of clearing AsyncStorage |
| `app/postDetails/[id].tsx` | Local `SESSION_USER` lookup → `auth.currentUser` (no longer needs `useFocusEffect` to reload the signed-in name — Firebase already knows who is signed in) |
| `api/authApi.ts` | New — all Firebase Auth operations |
| `utils/userData.ts`, `app/(tabs)/authenticationPage.tsx` | Removed — superseded by real Firebase Authentication |
