# Session 7 — Firebase Storage, Image Picker, and Image Editing

## What you will learn

- How to pick images from the device gallery with `expo-image-picker`
- How to take a photo with the camera
- How to crop and rotate images with `expo-image-manipulator`
- How to upload images to Firebase Storage
- How to store download URLs in Firestore
- How to display multiple images in a post
- How to show a likes progress bar toward a goal
- Local sign-up/sign-in accounts and editable comments, carried forward from Session 6

## How to run

```bash
cd session7-images
cp .env.example .env   # fill in your Firebase project values
npm install
npx expo start --clear
```

> **Note:** Image picker and camera require a real device or simulator with camera support. They do not work in the browser.

## Project structure

```
session7-images/
  app/
    _layout.tsx
    postDetails/[id].tsx  Image gallery, likes progress bar, editable comments
    (tabs)/
      index.tsx           Sort + My Posts / All Posts filter
      authenticationPage.tsx  Local sign-up / sign-in (from Session 6)
      profilePage.tsx         Signed-in account + sign out (from Session 6)
  api/
    imageApi.ts           New — upload image to Firebase Storage
    commentApi.ts         addComment, getCommentsByIds, updateComment, deleteComment
    postApi.ts            createPost, getAllPosts, getAllMyPosts, updatePost, toggleLike
  components/
    ImageSelector.tsx     New — pick/take/crop images, drag to reorder
    CommentModal.tsx      Add/edit comment popup (from Session 6)
    CommentsSection.tsx   Comment list with edit/delete (from Session 6)
    Post.tsx              Updated — shows first image as card thumbnail
    PostForm.tsx          Updated — integrates ImageSelector
    Spacer.tsx
  utils/
    userData.ts           Local accounts (sign up/sign in) — NOT Firebase Authentication
```

## Key concepts

### Image picker

```ts
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ["images"],
  allowsMultipleSelection: true,
  quality: 0.8,
});
```

### Image manipulator (crop / rotate)

```ts
const edited = await ImageManipulator.manipulateAsync(
  uri,
  [{ rotate: 90 }, { crop: { originX: 0, originY: 0, width: 400, height: 400 } }],
  { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
);
```

### Firebase Storage upload

```ts
const response = await fetch(localUri);
const blob = await response.blob();
const storageRef = ref(storage, `posts/${uploadId}/${index}.jpg`);
await uploadBytes(storageRef, blob);
const url = await getDownloadURL(storageRef);
```

The URL is then saved in Firestore so any device can load the image.

### Likes progress bar

```ts
const LIKE_GOAL = 10;
const likeCount = post.likes?.length ?? 0;
const progress = Math.min(likeCount / LIKE_GOAL, 1); // 0.0 → 1.0

<View style={{ height: 8, backgroundColor: "#ddd", borderRadius: 4 }}>
  <View
    style={{
      height: 8,
      borderRadius: 4,
      width: `${progress * 100}%`,
      backgroundColor: progress >= 1 ? "#34C759" : "#FF3B30",
    }}
  />
</View>
```

Bar turns green when the goal is reached. No extra library needed.

## What changed from Session 6

| File | Change |
|---|---|
| `api/imageApi.ts` | New — upload to Firebase Storage, return URL |
| `components/ImageSelector.tsx` | New — pick, camera, crop, rotate |
| `components/Post.tsx` | Added thumbnail from `imageUrls[0]` |
| `components/PostForm.tsx` | Added ImageSelector integration |
| `app/postDetails/[id].tsx` | Added image gallery display, likes progress bar |
| `utils/postData.ts` | Added `imageUrls?: string[]` to PostData |
| `package.json` | Added `expo-image-picker`, `expo-image-manipulator` |
| `utils/userData.ts`, `authenticationPage.tsx`, `profilePage.tsx` | Merged forward from Session 6 — local sign-up/sign-in accounts (AsyncStorage only, not Firebase Auth) |
| `api/postApi.ts`, `app/(tabs)/index.tsx` | Merged forward from Session 6 — `getAllMyPosts`, sort order, My Posts / All Posts toggle |
| `api/commentApi.ts`, `components/CommentModal.tsx`, `components/CommentsSection.tsx` | Merged forward from Session 6 — comment editing, replacing the old add-only `CommentForm.tsx` |

## What is NOT in this session (on purpose)

| Feature | Introduced in |
|---|---|
| Firebase Authentication (real backend auth) | Session 8 |
| Who can delete which post | Session 9 |
| NativeWind styling | Session 10 |

> Note: this session's sign-up/sign-in is a **local** simulation (accounts stored in AsyncStorage). Session 8 replaces it with real Firebase Authentication.

  rules_version = '2';
  service firebase.storage {
    match /b/{bucket}/o {
      match /{allPaths=**} {
        allow read, write: if request.auth != null;
      }
    }
  }