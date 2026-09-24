# Session 4 — Forms and Modals

Users can now **create posts** and **add comments**. Both happen in modals: a full-sheet **New Post** form opened from a floating **+** button, and a small popup for writing one comment. Everything is still saved on the device with AsyncStorage, and new posts and comments are credited to the signed-in user.

## Features

### Home tab
- The posts list from Session 3, loaded from local storage (the 5 sample posts are saved on first launch).
- The list reloads **every time the Home tab is opened**, so it picks up changes made elsewhere (like a new comment, or signing in).
- **Pull down to refresh**, and a red **Clear AsyncStorage** button that removes the saved posts.
- A round blue **+** button (floating action button) opens the New Post form.

### New Post form (modal)
- Slides up as a page sheet with **Cancel**, the title **New Post**, and **Post**.
- **Title** (required): pressing Post with an empty title shows "Title is required." under the field, with a red border. The error disappears as soon as you type.
- **Description** (optional, multi-line).
- **Hashtags as chips**: type a tag and press **+** or Enter. A leading `#` is removed, duplicates are ignored, and each chip has an **×** to remove it. On save, the chips become one string like `#expo #tools`.
- **Comments**: you can add comments to the post before publishing it.
- **Author** is filled in for you: the signed-in user's name, or "Anonymous" with the hint "sign in to set your name".
- Pressing **Post** adds the new post to the top of the list, saves it, and shows a "Post saved!" toast. Cancel (or closing the sheet) empties the form.

### Post details
- The header shows the post's title, with a back arrow only (no back label).
- Shows the title, author, description, and hashtags, then a **Comments (n)** section listing each comment's author and text, or "No comments yet."
- **+ Add comment** opens a small popup with a multi-line field, **Cancel**, and **Add**. Empty comments are ignored.
- A new comment is saved to local storage and confirmed with a "Comment added!" toast.

### Sign in and Profile tabs
- Same as Session 3: local sign up / sign in with validation, and a Profile tab with the avatar, **Sign out**, and **Clear all local data**.
- After signing in, the toast now says "Welcome back, *name*! Open the Profile tab."
- The Profile tab shows a spinner while it loads the signed-in user.

## How to run

```bash
cd session4-forms-modals
npm install
npx expo start
```

Press `i` to open the iOS simulator, `a` for Android, or `w` for the browser.

> If you ran Session 3 in the same browser or simulator, its saved posts have no `comments` field. Use **Clear AsyncStorage** on the Home tab (or **Clear all local data** on Profile) first, so the sample posts are saved again in the new format.

## Project structure

```
session4-forms-modals/
  app/
    _layout.tsx              Root Stack (tabs + post details) and the <Toast /> host
    postDetails/[id].tsx     Post details with comments, loaded from AsyncStorage
    (tabs)/
      _layout.tsx            Bottom tabs: Home, Profile, Sign in
      index.tsx              Home: posts list, + button, New Post modal
      authenticationPage.tsx Sign up / Sign in forms
      profilePage.tsx        Signed-in user, sign out, clear all data
  components/
    PostForm.tsx             New Post modal: title, description, hashtag chips, comments
    CommentsSection.tsx      Comments list + "Add comment" button
    CommentModal.tsx         Small popup for typing one comment
    Post.tsx                 Post card linking to its details
    Spacer.tsx               Empty View with a given height/width
  utils/
    postData.ts              PostData interface, now with comments
    dummyPostData.ts         5 sample posts (with empty comments)
    userData.ts              Account and signed-in-user helpers for AsyncStorage
```

## Key files to read

| File | Why it matters |
|---|---|
| `components/PostForm.tsx` | A full form in a `Modal`: several state variables, validation, chips, and reset |
| `components/CommentModal.tsx` | A small transparent `Modal` that owns its own text state |
| `components/CommentsSection.tsx` | A reusable component used both in the New Post form and on the details screen |
| `app/(tabs)/index.tsx` | The FAB, passing callbacks (`onClose`, `onSubmit`) down to `PostForm` |
| `app/postDetails/[id].tsx` | Updating one item inside a stored list and saving it back |

## Concepts explained

### Modals
`<Modal visible={...}>` shows content on top of the current screen. The parent owns the `visible` state and passes an `onClose` callback:
- `PostForm` uses `animationType="slide"` and `presentationStyle="pageSheet"`, a full sheet that slides up.
- `CommentModal` uses `transparent` and `animationType="fade"`, a small dialog over a dimmed background.
- `onRequestClose` handles the Android back button (and swiping the sheet down on iOS).

### Passing data up with callbacks
Children don't change the parent's data directly. They call a function the parent passed in:
- `PostForm` calls `onSubmit(newPost)`, and the Home screen adds it to the list and saves it.
- `CommentModal` calls `onAdd(text)`, which `CommentsSection` passes up as `onAddComment`.

This is why the same `CommentsSection` works in two places: in the New Post form it adds to the draft's comments, and on the details screen it saves to storage.

### Form validation and error state
The title error is its own piece of state (`titleError`). Pressing Post with an empty title sets it, which shows the red message and border. Typing clears it again.

### Updating an item in a stored list
To add a comment, the details screen:
1. builds a new post object with `{ ...post, comments: [...post.comments, newComment] }`,
2. updates the screen right away with `setPost(updatedPost)`,
3. reads the saved list, swaps in the updated post with `.map()`, and writes the list back.

Creating new objects and arrays with the spread operator (`...`), instead of changing the old ones, is what lets React notice the change.

### Keyboard handling
`KeyboardAvoidingView` moves the form up so the keyboard doesn't cover it, and `keyboardShouldPersistTaps="handled"` lets you tap the **+** chip button without first closing the keyboard.
