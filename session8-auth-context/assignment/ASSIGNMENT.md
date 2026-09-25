# Assignment — Author-Only Delete Button

**Session:** 8 — Authentication  
**Estimated time:** 30–45 min

---

## Goal

This connects what you learned about `useAuth()` to a real UI decision: only show an action if you own the item.

---

## What you need to do

### 1. Update `components/Post.tsx`

- Call `useAuth()` inside the component to get the current user
- Compare `post.author` with `user?.displayName` to decide whether to show the delete button
- When the delete button is tapped, call `deletePost(postData.id)` from `api/postApi`

```tsx
const { user } = useAuth();
const isAuthor = postData.author === user?.displayName;
```

Only render the delete button when `isAuthor` is true:

```tsx
{isAuthor && (
  <TouchableOpacity onPress={handleDelete}>
    <Text>🗑 Delete</Text>
  </TouchableOpacity>
)}
```

### 2. Handle the delete action

```tsx
async function handleDelete() {
  await deletePost(postData.id);
  // subscribeToPosts will update the list automatically
}
```

No manual state update needed — the `subscribeToPosts` listener in `index.tsx` fires when Firestore changes and removes the post from the list.

---

## Hints

**Import `useAuth`:**
```tsx
import { useAuth } from "@/context/AuthContext";
```

**Import `deletePost`:**
```tsx
import { deletePost } from "@/api/postApi";
```

**Where to place the delete button:**

Add it to the `footer` row, on the right side next to the author name. Only render it when `isAuthor === true`.

---

## Stretch goal

Show a confirmation alert before deleting:

```tsx
import { Alert } from "react-native";

function handleDelete() {
  Alert.alert(
    "Delete post",
    "Are you sure? This cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deletePost(postData.id) },
    ]
  );
}
```

---

## What to submit

- `components/Post.tsx` (updated — add `useAuth`, `deletePost`, delete button)
