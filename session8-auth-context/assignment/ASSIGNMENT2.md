# Assignment 2 — My Posts Tab

**Session:** 8 — Authentication  
**Estimated time:** 30–45 min

---

## Goal

Add a **My Posts** tab that shows only the posts written by the currently signed-in user.

This reinforces using `useAuth()` to personalise a screen based on who is logged in, and gives you practice fetching and filtering Firestore data.

---

## What you need to do

### 1. Create `app/(tabs)/myPosts.tsx`

- Call `useAuth()` to get the current user
- On focus, fetch all posts with `getAllPosts()` and filter to those where `post.author === user?.displayName`
- Show three states:
  - **Loading** — `ActivityIndicator`
  - **No posts yet** — a friendly empty message
  - **Has posts** — a `FlatList` of `<Post>` cards (reuse the existing `Post` component)

```tsx
const { user } = useAuth();

const myPosts = allPosts.filter(
  (post) => post.author === user?.displayName
);
```

### 2. Register the tab in `app/(tabs)/_layout.tsx`

Add a new `<Tabs.Screen>` for `myPosts`:

```tsx
<Tabs.Screen
  name="myPosts"
  options={{
    title: "My Posts",
    tabBarIcon: ({ color }) => (
      <AntDesign name="profile" size={24} color={color} />
    ),
  }}
/>
```

---

## Hints

**Reload when the tab is focused** (so new posts appear without a full restart):

```tsx
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

useFocusEffect(
  useCallback(() => {
    loadMyPosts();
  }, [])
);
```

**Fetch and filter:**

```tsx
async function loadMyPosts() {
  setLoading(true);
  const all = await getAllPosts();
  setMyPosts(all.filter((p) => p.author === user?.displayName));
  setLoading(false);
}
```

**Empty state:**

```tsx
if (myPosts.length === 0) {
  return (
    <View style={styles.centered}>
      <Text>No posts yet.</Text>
      <Text>Create your first post on the Home tab.</Text>
    </View>
  );
}
```

---

## Stretch goal

Show the total post count as a subtitle below the screen title:

```tsx
<Text style={styles.count}>{myPosts.length} post{myPosts.length !== 1 ? "s" : ""}</Text>
```

---

## What to submit

- `app/(tabs)/myPosts.tsx` (new)
- `app/(tabs)/_layout.tsx` (updated — one new `<Tabs.Screen>`)
