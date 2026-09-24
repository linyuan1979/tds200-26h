# Session 1 — Expo Setup, Project Structure, and Tab Layout

A first Expo Router app with two bottom tabs: a **Home** feed that lists posts, and a **Sign in** placeholder screen. The posts come from a static list in the code. There is no database, state, or user input yet.

## Features

- **Home tab**: a scrollable list of 5 posts, rendered with `FlatList`. Each post is a card showing the title, description, hashtags, and author.
- **Sign in tab**: a placeholder screen saying authentication comes later.
- **Tab bar**: 2 tabs with AntDesign icons (`home` and `login`).
- **Typed data**: every post follows a `PostData` TypeScript interface.

## How to run

```bash
cd session1-setup
npm install
npx expo start
```

Press `i` to open the iOS simulator, `a` for Android, or `w` for the browser. Session 1 needs no `.env` file.

## Project structure

```
session1-setup/
  app/
    _layout.tsx              Root layout: a Tabs navigator with the 2 tabs
    index.tsx                Home tab: list of posts
    authenticationPage.tsx   Sign in tab: placeholder
  utils/
    postData.ts              PostData interface (the shape of a post)
    dummyPostData.ts         5 static posts, plus getAllPosts() and getPostById()
  assets/images/             App icon, adaptive icon, splash icon, favicon
  app.json                   App config (name, icon, splash screen, typed routes)
  package.json               Dependencies and scripts (Expo SDK 54, Expo Router 6)
  tsconfig.json              TypeScript config, including the "@/" import alias
  .env.example               Placeholder; no variables needed yet
```

## Key files to read

| File | Why it matters |
|---|---|
| `app/_layout.tsx` | Creates the tab bar. Each `Tabs.Screen` `name` matches a file in `app/` |
| `app/index.tsx` | Shows how `FlatList` renders a list, and how `StyleSheet` styles the cards |
| `utils/postData.ts` | Shows how a TypeScript interface defines a data shape |
| `utils/dummyPostData.ts` | Static data and helper functions; no database yet |

## Concepts explained

### File-based routing
In Expo Router, the file name is the route:
- `app/index.tsx` is the default screen, shown first (the Home tab)
- `app/authenticationPage.tsx` is the Sign in tab
- `app/_layout.tsx` wraps the screens in the folder. Here it uses `<Tabs>`, so each screen becomes a bottom tab.

### FlatList
`FlatList` is the recommended way to render long, scrollable lists in React Native. It only renders the items visible on screen, which keeps it fast. `keyExtractor` gives each item a unique key (the post `id`), and `ItemSeparatorComponent` adds the gap between cards.

### StyleSheet
`StyleSheet.create({})` is how React Native defines styles. It looks like CSS but uses camelCase (`backgroundColor`, not `background-color`). The card shadow uses `shadow*` properties on iOS and `elevation` on Android.

### The `@/` import alias
`tsconfig.json` maps `@/*` to the project root, so `import { getAllPosts } from "@/utils/dummyPostData"` works from any folder.
