# Session 6 — Comments, Likes, and Camera

Posts become social. On the details screen you can **like** a post and **add, edit, and delete comments**, all stored in Firestore. The New Post form gets a **camera** so you can take pictures for a post, and the post cards show a picture, like count, and comment count.

## Features

### Home tab
- Posts from Firestore, with **Newest first / Oldest first** sorting and pull-to-refresh, as in Session 5.
- A new **All posts / My posts** button. The Home tab always starts on **All posts**; **My posts** shows only your own posts. If you're signed out, it shows "Sign in to see your own posts" instead.
- Each post card now shows:
  - the post's **first picture** at the top, if it has one,
  - **❤️ likes**, **💬 comments**, and **🖼 pictures** counts in the footer (each only when there is more than zero, or more than one picture).
- Saving a new post shows "Post saved!" or "Post with images saved!", or an error toast if it fails.

### New Post form
- Same fields as Session 5: title (required), description, hashtag chips, and author.
- Spaces inside a hashtag are removed, so `machine learning` becomes `#machinelearning`.
- A new **Images** section with a **📷 Camera** button (new posts only, not when editing):
  - The camera opens full screen with a close **✕** button, a **shutter** button, and a **⟳** button that switches between the front and back camera.
  - The first time, it asks for camera permission ("Grant permission").
  - Each photo appears as a thumbnail in a horizontal row, with a **✕** to remove it.
  - On a simulator/emulator there is no camera: it shows "Camera unavailable on simulator" and the shutter is disabled.

### Post details
- The header shows the post's title right away (it is passed along when you tap the card), before the post has loaded.
- **Pictures** scroll sideways in a gallery.
- **Like button**: a heart that switches between **Like** and **Unlike**, the number of likes, and "Liked by *names*". Likes are stored by name, and signed-out users like as "Anonymous".
- **Comments (n)**: loads the post's comments from Firestore, with a spinner while loading, or "No comments yet."
  - **+ Add comment** opens the comment popup. The **Add** button shows a spinner until Firestore has saved it.
  - Your own comments show a **pencil** (edit) and **✕** (delete). Editing reopens the popup with the text filled in and a **Save** button.
  - Comments are written as the signed-in user, or "Anonymous".
- **Edit** and **Delete** for the post, as in Session 5. Deleting a post now also deletes all its comments. On the web, the delete confirmation uses the browser's `confirm` dialog.

### Sign in and Profile tabs
- Unchanged: local sign up / sign in with AsyncStorage, and a Profile tab with **Sign out** and **Clear all local data**.

## How to run

1. Use the same Firebase project setup as Session 5 (Firestore in test mode). The app now also uses a `comments` collection, which Firestore creates automatically.
2. Copy the environment file and fill in your Firebase values:
   ```bash
   cd session6-comments-camera
   cp .env.example .env
   ```
3. Install and start:
   ```bash
   npm install
   npx expo start
   ```

To take pictures, run the app on a **real phone** with Expo Go (scan the QR code).

> **Pictures only work on the phone that took them.** A post stores the photo's local file path (`file://…`), not the picture itself, so other devices and the web can't show it.

## Project structure

```
session6-comments-camera/
  firebaseConfig.ts          Starts Firebase from the .env values and exports `db`
  api/
    postApi.ts               Post CRUD, "my posts" (sorted in the app), and toggleLike
    commentApi.ts            Comment CRUD in the "comments" collection
  app/
    _layout.tsx              Root Stack (tabs + post details) and the <Toast /> host
    postDetails/[id].tsx     Post with pictures, likes, comments, Edit and Delete
    (tabs)/
      _layout.tsx            Bottom tabs: Home, Profile, Sign in
      index.tsx              Home: sort and All/My posts buttons, + button
      authenticationPage.tsx Local sign up / sign in
      profilePage.tsx        Signed-in user, sign out, clear all data
  components/
    ImageSelector.tsx        Camera button, full-screen camera, thumbnail row
    CommentsSection.tsx      Comment list with edit/delete for your own comments
    CommentModal.tsx         Popup for adding or editing one comment
    PostForm.tsx             New Post / Edit Post modal, with images for new posts
    Post.tsx                 Post card with first picture and counts
    Spacer.tsx               Empty View with a given height/width
  utils/
    postData.ts              PostData (now with likes, comments, imageUrls, createdAt),
                             CommentData, CommentObject
    userData.ts              Local accounts and the signed-in user (AsyncStorage)
```

## Key files to read

| File | Why it matters |
|---|---|
| `api/commentApi.ts` | Comments as separate documents, linked to a post by id |
| `api/postApi.ts` | `toggleLike` with `arrayUnion` / `arrayRemove` |
| `app/postDetails/[id].tsx` | Likes with optimistic updates, and wiring up comment add/edit/delete |
| `components/ImageSelector.tsx` | `CameraView`, camera permissions, and taking a picture |
| `components/CommentsSection.tsx` | One modal used for both adding and editing |

## Concepts explained

### How comments are stored
Each comment is its own document in a `comments` collection (`{ authorId, comment }`). The post only keeps a list of comment **ids** in its `comments` array.
- **Add:** `addDoc` creates the comment, then `arrayUnion(newId)` adds its id to the post.
- **Read:** `getCommentsByIds(ids)` fetches each comment document.
- **Edit:** `updateDoc` changes only the comment document; the post doesn't change.
- **Delete:** `arrayRemove(id)` removes it from the post, then `deleteDoc` removes the comment.
- **Deleting a post** first deletes all of its comment documents with `deleteCommentsByIds`, so no orphaned comments are left behind.

### Array updates in Firestore
`arrayUnion(value)` adds a value only if it isn't already there, and `arrayRemove(value)` removes it if it is. Firestore does this on the server, so you don't have to read the array, change it, and write it back. Likes use this: `toggleLike` adds or removes your name from the post's `likes` array.

### Optimistic updates
When you tap the heart, the screen updates **first** (`setPost` with the new likes), and then the change is sent to Firestore. The app feels instant because it doesn't wait for the network. Comments work the other way round: the popup shows a spinner and waits for Firestore before closing.

### Showing buttons only to the owner
`CommentsSection` gets the current user's name (`currentAuthor`) and only shows edit/delete when `comment.authorId === currentAuthor`. This is a check in the app only, not a security rule.

### The camera
- `useCameraPermissions()` returns the current permission and a `requestPermission` function.
- `<CameraView ref={cameraRef} facing="back" | "front" />` shows the live camera. A `ref` lets you call a method on it: `cameraRef.current.takePictureAsync({ quality: 0.85 })` returns the photo's `uri`.
- `expo-device` (`Device.isDevice`) tells a simulator from a real phone, so the app can show a message instead of a black screen.

### Passing extra route parameters
The post card links with `params: { id, title }`. The details screen reads `title` with `useLocalSearchParams()` and uses it as the header title until the full post has loaded from Firestore.

### Sorting in the app instead of in the query
`getAllMyPosts` no longer uses `orderBy` together with `where`, because that combination needs a Firestore composite index. It fetches your posts and sorts them in JavaScript by `createdAt.seconds` instead, so no index setup is needed.
