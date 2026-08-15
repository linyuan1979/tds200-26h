# Session 1 — Expo Setup, Project Structure, and 3-Tab Layout

## What you will learn

- How to create and run an Expo project
- What the folder structure means
- How file-based routing works with Expo Router
- How to build a tab layout with 3 screens
- How to render a list of data with `FlatList`
- How to style components with `StyleSheet`

## How to run

```bash
cd session1-setup
npm install
npx expo start
```

Press `i` to open iOS simulator, `a` for Android, or `w` for the browser.

## Project structure

```
session1-setup/
  app/
    _layout.tsx             Root layout — wraps everything in a Stack navigator
    (tabs)/
      _layout.tsx           Defines the 3 bottom tabs
      index.tsx             Home screen — shows a list of posts
      profilePage.tsx       Profile screen — placeholder
      authenticationPage.tsx  Sign In screen — placeholder
  utils/
    postData.ts             The TypeScript type (interface) for a post
    dummyPostData.ts        Static list of posts used as example data
  app.json                  App configuration (name, icon, splash screen)
  package.json              Dependencies and scripts
```

## Key files to read

| File | Why it matters |
|---|---|
| `app/_layout.tsx` | Every Expo Router app needs a root layout |
| `app/(tabs)/_layout.tsx` | This is what creates the 3 bottom tabs |
| `app/(tabs)/index.tsx` | Shows how FlatList renders a list of items |
| `utils/postData.ts` | Shows how a TypeScript interface defines a data shape |
| `utils/dummyPostData.ts` | Static data — no database yet |

## What is NOT in this session (on purpose)

| Feature | Introduced in |
|---|---|
| State and interactivity | Session 3 |
| Forms and creating new posts | Session 4 |
| Database (Firebase Firestore) | Session 5 |
| Authentication | Session 8 |
| Styling with NativeWind | Session 10 |

## Concepts explained

### File-based routing
In Expo Router, the filename determines the route:
- `app/(tabs)/index.tsx` → the default tab screen (shown first)
- `app/(tabs)/profilePage.tsx` → the profile tab
- The `(tabs)` folder name wraps all three screens in tab navigation without adding to the URL

### FlatList
`FlatList` is the recommended way to render long scrollable lists in React Native.
It only renders items that are visible on screen, which is important for performance.

### StyleSheet
`StyleSheet.create({})` is React Native's way of defining styles.
It looks similar to CSS but uses camelCase (`backgroundColor` not `background-color`).
