# Session 7 — Images and Firebase Storage

Pictures now work on every device. Photos from the **camera** or the **photo gallery** are uploaded to **Firebase Storage**, and the post saves their permanent download URLs in Firestore. Before posting, you can **rotate** or **crop** each picture. The post details screen also gets a **likes progress bar**.

## Features

### New Post form: images
- Two buttons: **🖼 Gallery** and **📷 Camera** (new posts only, not when editing).
- **Gallery** asks for photo-library permission the first time, then lets you pick **several pictures at once**.
- **Camera** works as in Session 6: shutter, switch front/back camera, and close. On a simulator it shows "Simulator — use Gallery instead".
- Each picture appears as a thumbnail with three buttons:
  - **↻** rotates it 90°,
  - **✂** crops it to a centred square,
  - **✕** removes it.
  
  A spinner covers the thumbnail while it is being rotated or cropped.

### Saving a post with images
- When you press **Post**, a toast says "Uploading *n* image(s)…".
- Each picture is uploaded to Firebase Storage under `posts/<uploadId>/<index>_<time>.jpg`, one after the other.
- The post is then saved to Firestore with the download URLs, and a toast says "Post with images saved!".
- If anything fails, the toast says "Could not save post." with the reason (for example, "Selected image could not be read (empty file).").

### Post details
- The picture gallery now loads from Firebase Storage URLs, so it works on every phone and on the web.
- A new **❤️ Likes** progress bar towards a goal of 10 likes, showing "*n* / 10" and "*x* more likes to reach the goal", or "Goal reached! 🎉".
- Likes, comments, Edit, and Delete work as in Session 6.

### Home, Sign in, and Profile tabs
- Unchanged from Session 6: All posts / My posts, sorting, pull-to-refresh, post cards with the first picture and counts, local sign up / sign in, and the Profile tab.

## How to run

1. Use the Firebase project from Sessions 5 and 6 (Firestore in test mode).
2. In the Firebase Console, open **Storage** and click **Get started**. While learning, choose *test mode* so the app can upload files. (New Firebase projects may need to be on the pay-as-you-go *Blaze* plan to create a Storage bucket.)
3. Copy the environment file and fill in your Firebase values. Take `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` exactly as the console shows it (it may end in `.firebasestorage.app` or `.appspot.com`):
   ```bash
   cd session7-images
   cp .env.example .env
   ```
4. Install and start:
   ```bash
   npm install
   npx expo start
   ```

The **Gallery** button works on a simulator, a real phone, and the web. The **Camera** needs a real phone with Expo Go.

## Project structure

```
session7-images/
  firebaseConfig.ts          Starts Firebase and exports `db` (Firestore) and `storage` (Storage)
  app.json                   Camera and photo-library permission texts for iOS and Android
  api/
    imageApi.ts              uploadImage(): local file → Blob → Firebase Storage → download URL
    postApi.ts               Post CRUD, "my posts", and toggleLike
    commentApi.ts            Comment CRUD in the "comments" collection
  app/
    _layout.tsx              Root Stack (tabs + post details) and the <Toast /> host
    postDetails/[id].tsx     Post with image gallery, likes and progress bar, comments
    (tabs)/
      _layout.tsx            Bottom tabs: Home, Profile, Sign in
      index.tsx              Home; uploads the images, then creates the post
      authenticationPage.tsx Local sign up / sign in
      profilePage.tsx        Signed-in user, sign out, clear all data
  components/
    ImageSelector.tsx        Gallery + camera, thumbnails with rotate / crop / remove
    PostForm.tsx             New Post / Edit Post modal
    CommentsSection.tsx      Comment list with edit/delete for your own comments
    CommentModal.tsx         Popup for adding or editing one comment
    Post.tsx                 Post card with first picture and counts
    Spacer.tsx               Empty View with a given height/width
  utils/
    postData.ts              NewPostData (no id) and PostData (with id), CommentData, CommentObject
    userData.ts              Local accounts and the signed-in user (AsyncStorage)
```

## Key files to read

| File | Why it matters |
|---|---|
| `api/imageApi.ts` | The whole upload in a few lines: `fetch` → `blob` → `uploadBytes` → `getDownloadURL` |
| `app/(tabs)/index.tsx` | `handleNewPost`: upload every image first, then save the post with the URLs |
| `components/ImageSelector.tsx` | `expo-image-picker` for the gallery and `expo-image-manipulator` for rotate/crop |
| `firebaseConfig.ts` | Adding `getStorage(app)` next to Firestore |
| `app.json` | Permission messages the phone shows when asking for camera and photo access |

## Concepts explained

### Why upload images at all?
In Session 6 a post saved the photo's local path (`file://…`), which only exists on the phone that took it. Now the file itself is uploaded to **Firebase Storage**, and the post saves the **download URL** (`https://firebasestorage.googleapis.com/…`), which any device can load.

Firestore stores the post's data; Storage stores the files. The post links the two with `imageUrls`.

### How the upload works
`uploadImage(localUri, uploadId, index)` in `api/imageApi.ts`:
1. `fetch(localUri)` reads the local file, and `.blob()` turns it into a `Blob` (raw file data).
2. An empty blob means the file couldn't be read, so it throws an error instead of saving a broken image.
3. `ref(storage, "posts/<uploadId>/<index>_<time>.jpg")` chooses where the file goes. The `uploadId` and index keep every file's path unique.
4. `uploadBytes(ref, blob)` uploads it, and `getDownloadURL(ref)` returns the public URL.

The Home screen uploads the images one by one with `await` inside a `for` loop, collects the URLs, and only then calls `createPost({ ...post, imageUrls })`.

### Picking from the gallery
- `useMediaLibraryPermissions()` returns the photo-library permission and a function to ask for it.
- `ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true })` opens the gallery. If you didn't cancel, `result.assets` holds one object per picture, each with a `uri`.

### Editing images before upload
`ImageManipulator.manipulateAsync(uri, actions, options)` makes a **new** image file and returns its `uri`:
- `[{ rotate: 90 }]` rotates it.
- To crop to a square, it first reads the size (`manipulateAsync(uri, [])` with no actions), then crops a `size × size` square from the centre.

Both save as JPEG with `compress: 0.85`. The new `uri` replaces the old one in the list.

### Permissions in `app.json`
iOS and Android show a message when an app asks for the camera or photos. `app.json` sets these texts, through the `expo-image-picker` and `expo-camera` plugins, `ios.infoPlist`, and `android.permissions`. They are used when you build your own app; in Expo Go, Expo Go's own texts are shown.

### `NewPostData` and `PostData`
`NewPostData` is a post before it is saved: no `id`, because Firestore creates it. `PostData extends NewPostData` and adds the `id`. `PostForm` now submits a `NewPostData`, and `createPost` / `updatePost` take the same type.
