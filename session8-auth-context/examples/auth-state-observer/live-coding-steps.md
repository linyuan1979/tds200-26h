# Live Coding — Auth State Observer

## Step 1 — Raw observer, no UI

Show that `onAuthStateChanged` fires immediately on mount:

```tsx
export default function AuthStateObserverDemo() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("auth state changed:", user?.email ?? null);
    });
    return unsubscribe;
  }, []);

  return <View />;
}
```

Open the console. Point out it fires once immediately — that's Firebase reading the stored session.

## Step 2 — Capture state

Replace `console.log` with state:

```tsx
const [user, setUser] = useState<User | null | undefined>(undefined);

// inside onAuthStateChanged callback:
setUser(firebaseUser);
```

Render the three states:
```tsx
{user === undefined && <Text>Loading…</Text>}
{user === null && <Text>Not signed in</Text>}
{user != null && <Text>{user.email}</Text>}
```

Ask: "Why three states, not two?" → Show the loading flash problem if you use `null` as the initial value.

## Step 3 — Add sign-in form

Add email + password inputs and call `signInWithEmailAndPassword`. Show how the observer fires automatically after sign-in — no manual `setUser` needed.

```tsx
await signInWithEmailAndPassword(auth, email, password);
// observer fires → setUser(user) happens automatically
```

## Step 4 — Add sign-out + event log

Add a sign-out button and an event log array that records every observer call:

```tsx
setEvents((prev) => [newEntry, ...prev]);
```

Show the full timeline: loading → signed in → signed out → signed in again.

## Connect to the project

Point out that `context/AuthContext.tsx` does exactly this, but publishes the result via React Context so every screen can read it with `useAuth()` instead of setting up its own listener.
