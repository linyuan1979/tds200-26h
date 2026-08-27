# Session 3 — Lists, State, and Local Storage

## What you will learn

- How `useState` tracks values that change over time
- How `useEffect` runs side effects (loading, saving)
- How to persist data locally with `AsyncStorage`
- How to add a like button with optimistic UI updates
- How to pull-to-refresh a list with `RefreshControl`

## How to run

```bash
cd session3-state-storage
npm install
npx expo start --clear
```

Press `i` for iOS simulator, `a` for Android, or `w` for the browser.

## Project structure

```
session3-state-storage/
  app/
    _layout.tsx          Root Stack navigator
    postDetails/[id].tsx Post detail screen (Stack-navigated)
    (tabs)/
      _layout.tsx        3 bottom tabs
      index.tsx          Post list with state, storage, and like button
      profilePage.tsx    User profile stored in AsyncStorage
      authenticationPage.tsx  Placeholder
  components/
    Post.tsx             Post card — now includes a like button
    Spacer.tsx           Vertical/horizontal space helper
  utils/
    postData.ts          PostData interface
    dummyPostData.ts     Static posts list
    userData.ts          User profile helpers
```

## Key concepts

### useState

`useState` holds a value and re-renders the component when it changes:

```tsx
const [liked, setLiked] = useState(false);

<TouchableOpacity onPress={() => setLiked(!liked)}>
  <Text>{liked ? "❤️" : "🤍"}</Text>
</TouchableOpacity>
```

### AsyncStorage

`AsyncStorage` is a simple key/value store that survives app restarts:

```ts
// Save
await AsyncStorage.setItem("username", name);

// Load
const name = await AsyncStorage.getItem("username");
```

### useEffect

`useEffect` runs code after the component renders — perfect for loading saved data:

```tsx
useEffect(() => {
  AsyncStorage.getItem("username").then((saved) => {
    if (saved) setName(saved);
  });
}, []); // empty array = run once on mount
```

## What changed from Session 2

| File | Change |
|---|---|
| `app/(tabs)/index.tsx` | Added `useState`, `AsyncStorage`, `RefreshControl` |
| `app/(tabs)/profilePage.tsx` | Added name input saved to `AsyncStorage` |
| `components/Post.tsx` | Added like button with local state |
| `utils/userData.ts` | New — user profile helpers |
| `package.json` | Added `@react-native-async-storage/async-storage` |

## What is NOT in this session (on purpose)

| Feature | Introduced in |
|---|---|
| Creating new posts | Session 4 |
| Firebase database | Session 5 |
| Authentication | Session 8 |
| NativeWind styling | Session 10 |
