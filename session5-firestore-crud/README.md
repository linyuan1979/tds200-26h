# Session 5 — Firebase Firestore CRUD

## What you will learn

- How to connect an Expo app to Firebase
- How Firestore stores data as documents in collections
- How to create, read, update, and delete (CRUD) Firestore documents
- How `serverTimestamp()` stores consistent timestamps
- How to refetch data on pull-to-refresh and on screen focus
- How to structure Firebase config safely with environment variables

## How to run

```bash
cd session5-firestore-crud
cp .env.example .env   # fill in your Firebase project values
npm install
npx expo start --clear
```

## Project structure

```
session5-firestore-crud/
  app/
    _layout.tsx               Root Stack navigator
    postDetails/[id].tsx      Post detail — view, edit, delete
    (tabs)/
      _layout.tsx             Tab navigator (Home, Profile, Sign in)
      index.tsx               Home — fetches posts from Firestore
      profilePage.tsx         Shows the signed-in user (from AsyncStorage)
      authenticationPage.tsx  Local sign up / sign in (AsyncStorage, no Firebase Auth yet)
  api/
    postApi.ts                Firestore CRUD operations for posts
  components/
    Post.tsx                  Single post card, links to postDetails
    PostForm.tsx               Modal form, used for both create and edit
    Spacer.tsx                 Small layout helper
  utils/
    postData.ts                PostData interface
    userData.ts                Local user accounts + session (AsyncStorage)
  examples/
    firestore-crud-basics/    Standalone CRUD demo used for live coding
  assignment/                 Practice exercises with solutions
  firebaseConfig.ts           Initialises Firebase from .env variables
  .env.example                Required environment variable names
```

## Key concepts

### Firestore data model

Data lives in **collections** → **documents** → **fields**:

```
posts/          ← collection
  abc123/       ← document (auto-generated id)
    title: "My post"
    description: "..."
    hashtags: "#expo #reactnative"
    author: "Jane"
    createdAt: Timestamp
```

### CRUD with postApi.ts

```ts
// CREATE
await createPost({ title, description, hashtags, author });

// READ — all posts, newest first
const posts = await getAllPostsSorted();

// READ — one post by id
const post = await getPostById(id);

// UPDATE — only the fields you pass are changed; everything else stays the same
await updatePost(id, { title, description, hashtags });

// DELETE
await deletePost(id);
```

Note: this session fetches data on demand (on screen focus and pull-to-refresh)
rather than subscribing with `onSnapshot`. Real-time listeners are not used here.

### Environment variables

Firebase credentials go in `.env`, not in source code:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
```

Prefix `EXPO_PUBLIC_` makes a variable available in the client bundle.

## What changed from Session 4

| File | Change |
|---|---|
| `firebaseConfig.ts` | New — connects to Firebase using .env values |
| `api/postApi.ts` | New — create, read, update, delete for posts |
| `app/(tabs)/index.tsx` | Replaced dummy data with `getAllPosts` from Firestore |
| `app/postDetails/[id].tsx` | Loads, edits, and deletes a post via Firestore |
| `components/PostForm.tsx` | Shared modal form for creating and editing a post |
| `package.json` | Added `firebase` |

## What is NOT in this session (on purpose)

| Feature | Introduced in |
|---|---|
| Real-time updates (`onSnapshot`) | Session 6 |
| Comments | Session 6 |
| Image upload | Session 7 |
| Firebase Authentication | Session 8 |
| NativeWind styling | Session 10 |

Sign up / sign in on this session's Sign in tab is a **local-only** simulation
using AsyncStorage — it does not use Firebase Authentication yet.
