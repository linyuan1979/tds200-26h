# Solution Notes — My Posts Tab

## Files changed

| File | What changed |
|---|---|
| `app/(tabs)/myPosts.tsx` | New screen |
| `app/(tabs)/_layout.tsx` | One new `<Tabs.Screen name="myPosts">` |

### `_layout.tsx` change

```tsx
<Tabs.Screen
  name="myPosts"
  options={{
    title: "My Posts",
    tabBarIcon: ({ color }) => <AntDesign name="profile" size={24} color={color} />,
  }}
/>
```

---

## Key decisions

### `useFocusEffect` instead of `useEffect`

```tsx
useFocusEffect(
  useCallback(() => {
    loadMyPosts();
  }, [user?.displayName])
);
```

`useEffect([], [])` runs once on mount. If the user creates a new post on the Home tab and switches to My Posts, the list would be stale. `useFocusEffect` re-runs every time the tab becomes visible, so the list is always fresh.

`useCallback` is required by `useFocusEffect` — it memoises the function so it isn't re-created on every render. The dependency `[user?.displayName]` ensures a re-fetch if the user somehow changes.

### `getAllPosts` + client-side filter vs a Firestore query

```tsx
const all = await getAllPosts();
setMyPosts(all.filter((p) => p.author === user?.displayName));
```

This fetches all posts and filters in JavaScript. Simple and reuses the existing `getAllPosts` function.

The trade-off: on a large dataset, a Firestore `where` query would be more efficient:
```ts
query(collection(db, "posts"), where("author", "==", user.displayName))
```
For a teaching project this is fine. The Firestore `where` version can be introduced in a later session when query patterns are covered.

### Comparing by `displayName`

The same trade-off noted in Assignment 1 applies here — `PostData.author` stores the display name string, not the uid. Matching by name is sufficient for now.

### The `Post` component already handles delete

Because Assignment 1 added a delete button to `Post`, My Posts automatically gets that too — users can delete their own posts directly from this tab without any extra code.
