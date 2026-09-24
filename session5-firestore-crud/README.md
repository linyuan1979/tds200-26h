# Session 5 — Firestore CRUD

Posts now live in the cloud. The app stores them in a **Firebase Firestore** `posts` collection and supports all four **CRUD** operations: **C**reate a post, **R**ead the list and a single post, **U**pdate it through an Edit form, and **D**elete it. Sign in still works locally with AsyncStorage, and it decides which posts the Home tab shows.

## Features

### Home tab
- Loads posts from Firestore, with a spinner ("Loading posts…") while waiting.
- **Signed out:** shows every post. **Signed in:** shows only your own posts (where `author` equals your name).
- A **Newest first / Oldest first** button switches the sort order by creation time.
- **Pull down to refresh.**
- An empty list shows "No posts yet." (or "You have no posts yet." when signed in) and "Tap + to create the first one."
- The **+** button opens the New Post form. Saving writes the post to Firestore, shows "Post saved!", and reloads the list.
- If loading fails, an error toast shows "Could not load posts" and the reason.

### New Post / Edit Post form (modal)
- One `PostForm` component, used in two modes:
  - **New Post** (from Home): empty form, **Post** button, author shown with the hint "from Sign In tab".
  - **Edit Post** (from Post details): pre-filled with the post's title, description, and hashtags, with a **Save** button.
- Title is required; description is optional; hashtags are added as removable chips.
- The author is the signed-in user's name, or "Anonymous". Editing never changes the author.

### Post details
- Loads a single post from Firestore by its id. The header shows the post's title.
- Shows the title, author, description, and each hashtag as a chip.
- **Edit** opens the form in edit mode. Saving updates Firestore and the screen right away.
- **Delete** asks "This will permanently delete the post. Continue?". Confirming deletes it from Firestore and goes back.

### Sign in and Profile tabs
- Unchanged from Session 4: local sign up / sign in with AsyncStorage, and a Profile tab with **Sign out** and **Clear all local data**.

## How to run

1. Create a Firebase project and add a **Web app** to it.
2. Create a **Firestore database**. While learning, start it in *test mode* so the app can read and write.
3. Copy the environment file and fill in your values from *Firebase Console → Project settings → Your apps → SDK setup and configuration*:
   ```bash
   cd session5-firestore-crud
   cp .env.example .env
   ```
4. Install and start:
   ```bash
   npm install
   npx expo start
   ```

Press `i` to open the iOS simulator, `a` for Android, or `w` for the browser. Restart `npx expo start` after changing `.env`.

> **Index needed for "my posts":** listing one author's posts sorted by date (`where("author", "==", …)` + `orderBy("createdAt")`) needs a Firestore *composite index*. The first time you sign in and open Home, Firestore logs an error in the terminal with a link that creates the index. Open it, wait until the index is built, then refresh.

> **On the web**, React Native's `Alert.alert` does not show a dialog, so the Delete confirmation only works on iOS and Android.

## Project structure

```
session5-firestore-crud/
  firebaseConfig.ts          Starts Firebase from the .env values and exports `db`
  .env.example               The Firebase keys you need to fill in (copy to .env)
  api/
    postApi.ts               All Firestore calls: create, get all, get mine, get one, update, delete
  app/
    _layout.tsx              Root Stack (tabs + post details) and the <Toast /> host
    postDetails/[id].tsx     One post from Firestore, with Edit and Delete
    (tabs)/
      _layout.tsx            Bottom tabs: Home, Profile, Sign in
      index.tsx              Home: Firestore posts, sort button, + button
      authenticationPage.tsx Local sign up / sign in
      profilePage.tsx        Signed-in user, sign out, clear all data
  components/
    PostForm.tsx             New Post / Edit Post modal
    Post.tsx                 Post card linking to its details
    Spacer.tsx               Empty View with a given height/width
  utils/
    postData.ts              PostData interface (id, title, description, hashtags, author)
    userData.ts              Local accounts and the signed-in user (AsyncStorage)
```

## Key files to read

| File | Why it matters |
|---|---|
| `firebaseConfig.ts` | `initializeApp` + `getFirestore`, with keys read from `process.env` |
| `api/postApi.ts` | Every database call in one place, one function per CRUD operation |
| `app/(tabs)/index.tsx` | Choosing between "all posts" and "my posts", and re-sorting |
| `app/postDetails/[id].tsx` | Reading one document, then updating or deleting it |
| `components/PostForm.tsx` | One form for both creating and editing, switched by `initialData` |

## Concepts explained

### Firestore basics
Firestore stores **documents** (JSON-like objects) inside **collections**. Every post is a document in the `posts` collection. Firestore creates the document id itself when you use `addDoc`, which is why `NewPost` has no `id` field.

### CRUD with the Firebase SDK

| Operation | Function in `postApi.ts` | Firestore call |
|---|---|---|
| Create | `createPost(data)` | `addDoc(collection(db, "posts"), { ...data, createdAt: serverTimestamp() })` |
| Read all | `getAllPosts(order)` | `getDocs(query(collection, orderBy("createdAt", order)))` |
| Read mine | `getAllMyPosts(author, order)` | adds `where("author", "==", author)` to the query |
| Read one | `getPostById(id)` | `getDoc(doc(db, "posts", id))`; returns `null` if it doesn't exist |
| Update | `updatePost(id, data)` | `updateDoc(...)`; only the fields you pass change |
| Delete | `deletePost(id)` | `deleteDoc(...)` |

`serverTimestamp()` lets Firestore fill in the creation time, which the list is sorted by. Each result is turned into a `PostData` with `{ id: d.id, ...d.data() }`.

### Environment variables
The Firebase keys are kept out of the code. `firebaseConfig.ts` reads them from `process.env.EXPO_PUBLIC_FIREBASE_*`. Expo only exposes variables that start with `EXPO_PUBLIC_` to the app. `.env` is listed in `.gitignore`, so your real keys are never committed; `.env.example` shows which keys are needed.

### An API layer
Screens never call Firestore directly. They call functions like `createPost()` or `deletePost()` from `api/postApi.ts`. If the database changes later, only this one file has to change.

### One form for create and edit
`PostForm` is in edit mode when it gets an `initialData` prop (`isEditMode = !!initialData`). A `useEffect` fills in the fields each time the modal opens, and the heading and button change between "New Post / Post" and "Edit Post / Save".

### Error handling
`loadPosts()` uses `try / catch / finally`: errors are shown in a toast, and `finally` always turns the spinner off, whether loading worked or not.
