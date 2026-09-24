# Session 2 — Components and Navigation

The post feed from Session 1, now built from reusable components and wrapped in three layers of navigation: a side **drawer**, **bottom tabs**, and a **stack** inside the Home tab. Tapping a post opens its details on a separate screen. The posts are still a static list in the code.

## Features

- **Drawer menu** (swipe from the left edge or tap the menu icon) with two entries: **Home** and **Settings**.
- **3 bottom tabs**: Home, Profile, and Sign in, each with an AntDesign icon.
- **Home tab**: a list of 5 posts. Each card is a reusable `Post` component.
- **Post details**: tapping a post's title or description opens `Post Details`, showing the title, author, description, and hashtags. An unknown id shows "Post not found."
- **Header buttons**: a gear icon on the Posts screen opens Settings; a back arrow on Post Details goes back.
- **Profile, Sign in, and Settings**: placeholder screens.
- **Start redirect**: opening the app at `/` sends you straight to `/home`.

## How to run

```bash
cd session2-components-navigation
npm install
npx expo start
```

Press `i` to open the iOS simulator, `a` for Android, or `w` for the browser. Session 2 needs no `.env` file.

## Project structure

```
session2-components-navigation/
  app/
    _layout.tsx                  Root layout: Drawer (Home, Settings)
    index.tsx                    Redirects "/" to "/home"
    settingsScreen.tsx           Settings screen (placeholder)
    (tabs)/
      _layout.tsx                Bottom tabs: Home, Profile, Sign in
      profilePage.tsx            Profile tab (placeholder)
      authenticationPage.tsx     Sign in tab (placeholder)
      home/
        _layout.tsx              Stack inside the Home tab, with header buttons
        index.tsx                Posts list
        postDetails/[id].tsx     Details for one post, chosen by id
  components/
    Post.tsx                     One post card, linking to its details
    Spacer.tsx                   Empty View with a given height/width
  utils/
    postData.ts                  PostData interface
    dummyPostData.ts             5 static posts, getAllPosts() and getPostById()
  babel.config.js                Adds the react-native-reanimated plugin (needed by the drawer)
```

## Key files to read

| File | Why it matters |
|---|---|
| `app/_layout.tsx` | The outermost navigator: a `Drawer` wrapped in `GestureHandlerRootView` |
| `app/(tabs)/_layout.tsx` | The bottom tabs, nested inside the drawer |
| `app/(tabs)/home/_layout.tsx` | A `Stack` nested inside the Home tab, with `headerRight` / `headerLeft` buttons |
| `app/(tabs)/home/postDetails/[id].tsx` | A dynamic route that reads `id` with `useLocalSearchParams()` |
| `components/Post.tsx` | A component that gets its data through props and navigates with `<Link>` |
| `components/Spacer.tsx` | The simplest component with props, including default values |

## Concepts explained

### Components and props
A component is a function that returns JSX. The parent passes data in through props: `<Post postData={item} />` hands one post to `Post`, and `<Spacer height={12} />` sets the gap size. `Spacer` falls back to `height = 16` when no height is given.

### Nested navigators
Each `_layout.tsx` defines the navigator for its folder, so the folders nest the navigators:
- `app/_layout.tsx` → **Drawer**
- `app/(tabs)/_layout.tsx` → **Tabs** inside the drawer
- `app/(tabs)/home/_layout.tsx` → **Stack** inside the Home tab

The `(tabs)` folder is a *group*: the brackets keep it out of the URL, so the Home tab lives at `/home`, not `/(tabs)/home`.

### Dynamic routes
`postDetails/[id].tsx` matches any id, for example `/home/postDetails/p1`. The screen reads the value with `useLocalSearchParams()` and looks the post up with `getPostById(id)`.

### Navigating
- **Declarative:** `<Link href={{ pathname: "/home/postDetails/[id]", params: { id } }}>` in `Post.tsx`.
- **In code:** `useRouter()` gives `router.push("/settingsScreen")` and `router.back()`, used by the header buttons.
- **Redirect:** `<Redirect href="/home" />` in `app/index.tsx`.

### FlatList extras
The Posts list uses `ListHeaderComponent`, `ListFooterComponent`, and `ItemSeparatorComponent` (all `Spacer`s) to add space above, below, and between the cards.
