# Example — React Context Counter

Demonstrates how React Context works using a simple counter — before connecting it to Firebase Auth.

## What you will see

Two components — `CountDisplay` and `CountButtons` — that share state without passing any props between them. Both read from `CounterContext` via `useContext`.

## The four-step pattern

This is the same pattern used in `AuthContext.tsx`, just with a counter instead of a Firebase user:

| Step | Code | Purpose |
|---|---|---|
| 1 | `type CounterContextType = { ... }` | Define what the context holds |
| 2 | `createContext(defaultValue)` | Create the context object |
| 3 | `CounterProvider` | Hold state, wrap children with `<Context.Provider value={...}>` |
| 4 | `useContext(CounterContext)` | Read from context in any descendant |

## Why not just use props?

If `CountDisplay` and `CountButtons` were siblings inside a parent, you would need to:
- Lift `count` state to the parent
- Pass `count` down as a prop to `CountDisplay`
- Pass `increment` and `reset` down as props to `CountButtons`

With context, none of that is needed. Any component anywhere in the tree can read the value directly. This is called avoiding **prop drilling**.

## Compare to `AuthContext.tsx`

```
CounterContext          AuthContext
─────────────           ──────────
CounterProvider    →    AuthProvider
  count            →      user
  increment        →      (provided by Firebase)
  reset            →      (provided by signOut)
useContext(...)    →    useAuth()
```

`useAuth()` is just a thin wrapper around `useContext(AuthContext)` — the same pattern as calling `useContext(CounterContext)` directly, but with a cleaner name.
