# Example — Auth State Observer

Shows exactly what `onAuthStateChanged` returns and when it fires.

## What you will see

1. On load — the observer fires immediately with the persisted session (or `null`)
2. After sign-in — fires again with the full Firebase `User` object
3. After sign-out — fires again with `null`

The event log at the bottom records every time the observer fires, so you can see the full timeline.

## Key idea

`onAuthStateChanged` is a **listener**, not a one-time call. You register it once and it calls your callback automatically whenever auth state changes. The return value is an `unsubscribe` function — always return it from `useEffect` so the listener is removed when the component unmounts.

```ts
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    // called immediately with current state, then on every change
  });
  return unsubscribe; // cleanup
}, []);
```

## The three states of `user`

| Value | Meaning |
|---|---|
| `undefined` | Firebase is still reading the persisted session — show a spinner |
| `null` | Firebase confirmed nobody is signed in — show auth screen |
| `User` | Firebase confirmed a user is signed in — show the app |

The `User` object contains `.uid`, `.email`, `.displayName`, `.providerData`, and more.
