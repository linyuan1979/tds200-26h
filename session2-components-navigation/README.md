# Session 2 — Components, JSX, and Navigation

## What you will learn

- How to extract a reusable **component** with **props**
- How to nest navigators: a Stack inside a Tab
- How to create a **dynamic route** using `[id].tsx`
- How to read route parameters with `useLocalSearchParams`
- How the `Link` component navigates between screens
- How file location in `app/` determines the navigation structure
- How to add a button to a screen header with `headerRight`
- How to navigate imperatively with `router.push()`

## How to run

```bash
cd session2-components-navigation
npm install
npx expo start --clear
```

Press `i` for iOS simulator, `a` for Android, or `w` for the browser.

## Project structure

```
session2-components-navigation/
  app/
    _layout.tsx                   Root Stack navigator
    (tabs)/
      _layout.tsx                 3 bottom tabs: Home, Profile, Sign In
      home/
        _layout.tsx               Stack navigator inside the Home tab
        index.tsx                 Post list — uses the Post component
        postDetails/
          [id].tsx                Dynamic route — shows one post by its id
      profilePage.tsx             Placeholder
      authenticationPage.tsx      Placeholder
  components/
    Post.tsx                      Reusable card component — receives postData as a prop
    Spacer.tsx                    Simplest component with props — adds vertical/horizontal space
  utils/
    postData.ts                   TypeScript interface for a post
    dummyPostData.ts              Static list of 5 posts
```

## The navigation hierarchy

```
Root Stack
  └── (tabs)
        ├── Home tab → Stack
        │               ├── index.tsx          post list
        │               └── postDetails/[id]   post detail
        ├── Profile tab
        └── Sign In tab
```

## Key concepts explained

### Components and props

In Session 1, each post was rendered with inline JSX inside `index.tsx`.
In Session 2, that JSX is extracted into `components/Post.tsx`.

**Before (Session 1 — inline JSX):**
```tsx
renderItem={({ item }) => (
  <View style={styles.card}>
    <Text>{item.title}</Text>
    <Text>{item.description}</Text>
  </View>
)}
```

**After (Session 2 — reusable component):**
```tsx
renderItem={({ item }) => <Post postData={item} />}
```

The `Post` component receives `postData` as a **prop**.
Props are how a parent passes data down to a child component.
Now `Post` can be reused anywhere in the app without duplicating code.

### Props with TypeScript

```tsx
type PostProps = {
  postData: PostData;
};

export default function Post({ postData }: PostProps) { ... }
```

The `type` tells TypeScript exactly what the component expects.
If you forget to pass `postData`, TypeScript shows an error immediately.

### A Stack inside a Tab

The Home tab has its own `_layout.tsx` with a Stack navigator.
This lets you navigate "deeper" within the tab — from the list to a detail screen —
while the tab bar stays visible at the bottom.

```
(tabs)/
  home/
    _layout.tsx        ← Stack that owns the screens below
    index.tsx          ← first screen in the stack
    postDetails/[id]   ← pushed onto the stack when you tap a post
```

### Dynamic routes

The file `postDetails/[id].tsx` creates a route that accepts any value for `[id]`.

- Navigate to `/home/postDetails/p1` → `id` is `"p1"`
- Navigate to `/home/postDetails/p3` → `id` is `"p3"`

The `id` is read inside the screen:
```tsx
const { id } = useLocalSearchParams<{ id: string }>();
const post = getPostById(id);
```

### The Link component

`Link` turns any element into a navigation trigger:
```tsx
<Link href={{ pathname: "/home/postDetails/[id]", params: { id: postData.id } }}>
  <Text>{postData.title}</Text>
</Link>
```

---

## Reference: Drawer navigator

A **Drawer navigator** adds a slide-in side menu (swipe from the left edge).
It requires `react-native-gesture-handler` and `react-native-reanimated` as native dependencies,
which need a **development build** — they do not work reliably in Expo Go.

The Drawer is not used in this session. The code below shows what the setup looks like if you add it later:

**Install:**
```bash
npx expo install @react-navigation/drawer react-native-gesture-handler react-native-reanimated
```

**`babel.config.js`** — the reanimated Babel plugin must be last:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

**`app/_layout.tsx`** with Drawer:
```tsx
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer>
        <Drawer.Screen name="(tabs)" options={{ title: "Home" }} />
        <Drawer.Screen name="settings" options={{ title: "Settings" }} />
      </Drawer>
    </GestureHandlerRootView>
  );
}
```

The Drawer is introduced in production apps once you have a development build configured.

---

## Navigation workflow — how it all fits together

This app uses three navigators nested inside each other.
Understanding *why* each one is used, and *how they interact*, is the main teaching goal of Session 2.

### The full hierarchy

```
Drawer (root)
  ├── (tabs)               ← "Home" entry in the Drawer menu
  │     ├── Home tab
  │     │     └── Stack
  │     │           ├── index.tsx          post list
  │     │           └── postDetails/[id]   post detail
  │     ├── Profile tab
  │     └── Sign In tab
  └── settingsScreen       ← "Settings" entry in the Drawer menu
```

### Why Drawer at the root?

The Drawer is the **outermost** navigator because it controls the top-level sections of the app.
Swipe in from the left edge (or use the hamburger icon) to see all top-level destinations: Home and Settings.

Use a Drawer when:
- you have sections that users switch between infrequently
- you want to keep the main screen uncluttered (the menu is hidden until needed)
- your app has more sections than fit comfortably in a tab bar

### Why Tabs inside the Drawer?

The `(tabs)` screen is what the Drawer opens by default.
Inside it, a **Tab navigator** controls the three main sections: Home, Profile, Sign In.

Use Tabs when:
- users switch between sections frequently
- you want all main destinations always visible at a glance
- the sections are at the same level (none is "deeper" than another)

### Why a Stack inside the Home tab?

The Home tab has its own `_layout.tsx` with a **Stack navigator**.
This lets you go from a post list to a post detail screen, then press Back to return.

Use a Stack when:
- navigation is hierarchical (parent → child → grandchild)
- users need a clear way to go back
- screens have a "depth" relationship (list → detail is the classic case)

### What happens when you tap the gear icon?

The gear icon in the Posts header calls `router.push("/settingsScreen")`.

Because `settingsScreen` is registered as a **Drawer screen** (in `app/_layout.tsx`), navigating to it uses the Drawer's transition — the menu slides in and the Settings screen becomes active. This is the same result as opening the Drawer manually and tapping "Settings".

This is expected behavior: with a Drawer as the root navigator, all top-level screens are Drawer screens. Both the gear icon and the Drawer menu item lead to the same place via the same navigation mechanism.

### User flows at a glance

| What the user does | Which navigator handles it |
|---|---|
| Swipe from left edge | Drawer |
| Tap "Settings" in the Drawer menu | Drawer |
| Tap the gear icon in the header | Drawer (`router.push` to a Drawer screen) |
| Tap Home / Profile / Sign In at the bottom | Tabs |
| Tap a post card | Stack (pushes postDetails) |
| Tap the back arrow on the detail screen | Stack (pops postDetails) |

---

## What is NOT in this session (on purpose)

| Feature | Introduced in |
|---|---|
| `useState` and like button | Session 3 |
| Forms and creating new posts | Session 4 |
| Database (Firebase Firestore) | Session 5 |
| Authentication | Session 8 |
| NativeWind styling | Session 10 |
| Drawer (requires dev build + gesture-handler) | Not part of this course |
