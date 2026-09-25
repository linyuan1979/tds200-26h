# Solution Notes — Author-Only Delete Button

## Files changed

| File | What changed |
|---|---|
| `components/Post.tsx` | Added `useAuth()`, `isAuthor` check, delete button with `Alert` confirmation |

---

## Key decisions

### `useAuth()` inside `Post` — not a prop

The current user could be passed as a prop from `index.tsx` down to `Post`, but that creates unnecessary coupling. `Post` already knows everything about the post — it should be self-contained.

Calling `useAuth()` directly inside `Post` is the idiomatic context pattern. No prop changes needed in `index.tsx`.

```tsx
// ✅ clean — Post is self-contained
const { user } = useAuth();

// ❌ needlessly couples parent to child
<Post postData={item} currentUser={user} />
```

### Comparing by `displayName`, not `uid`

```tsx
const isAuthor = postData.author === user?.displayName;
```

`PostData.author` stores the display name string (set when the post was created from `user.displayName`). It does not store the Firebase `uid`. So the comparison must use `displayName`.

This is a trade-off: if the user changes their display name, old posts will no longer match. A more robust solution (introduced in later sessions) is to store `authorId: user.uid` on the post and compare UIDs instead.

### No manual list update after delete

```tsx
onPress: () => deletePost(postData.id),
```

`index.tsx` uses `subscribeToPosts` (a Firestore real-time listener). When the document is deleted, Firestore pushes the update and `subscribeToPosts` fires automatically — removing the post from the list without any extra state management.

### `Alert.alert` for confirmation

Destructive actions should always require confirmation. `Alert.alert` with `style: "destructive"` renders the button in red on iOS (standard destructive style).

```tsx
Alert.alert("Delete post", "Are you sure?", [
  { text: "Cancel", style: "cancel" },
  { text: "Delete", style: "destructive", onPress: () => deletePost(postData.id) },
]);
```

The `Cancel` action does nothing — `Alert.alert` closes automatically.
