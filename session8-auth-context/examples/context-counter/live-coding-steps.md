# Live Coding — React Context Counter

## Step 1 — The problem: prop drilling

Start without context. Show a parent that holds `count` and has to pass it down:

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <CountDisplay count={count} />          {/* prop */}
      <CountButtons onIncrement={() => setCount(c => c + 1)} />  {/* prop */}
    </>
  );
}
```

Ask: "What if `CountDisplay` was 5 levels deep? We'd pass the prop through every level."

## Step 2 — Create the context

```tsx
type CounterContextType = { count: number; increment: () => void };
const CounterContext = createContext<CounterContextType>({ count: 0, increment: () => {} });
```

Explain: `createContext` creates a "channel" that any descendant can tap into.

## Step 3 — Add the Provider

```tsx
function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  return (
    <CounterContext.Provider value={{ count, increment: () => setCount(c => c + 1) }}>
      {children}
    </CounterContext.Provider>
  );
}
```

The Provider is the source of truth. Anything wrapped in it can read `value`.

## Step 4 — Consume with useContext

```tsx
function CountDisplay() {
  const { count } = useContext(CounterContext);
  return <Text>{count}</Text>;
}

function CountButtons() {
  const { increment } = useContext(CounterContext);
  return <TouchableOpacity onPress={increment}><Text>+1</Text></TouchableOpacity>;
}
```

No props. Both components tap directly into the context.

## Step 5 — Wire it together

```tsx
export default function ContextCounterDemo() {
  return (
    <CounterProvider>
      <CountDisplay />
      <CountButtons />
    </CounterProvider>
  );
}
```

## Connect to AuthContext

Open `context/AuthContext.tsx` side by side. Show that it's the exact same pattern:
- `AuthProvider` = `CounterProvider`
- `user` = `count`
- `useAuth()` = `useContext(CounterContext)` with a cleaner name

The only difference is that `AuthContext` gets its state from `onAuthStateChanged` instead of `useState`.
