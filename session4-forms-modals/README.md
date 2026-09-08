# Session 4 — Forms, Modals, and Creating Data

## What you will learn

- How to build a controlled form with `TextInput` and validation
- How to open and close a `Modal`, including a full-screen form and a small centered dialog
- How to nest a modal inside another modal (the "add comment" popup inside the post form)
- How to use `KeyboardAvoidingView` so the keyboard doesn't cover inputs
- How to pass callback functions (`onSubmit`, `onClose`, `onAdd`) as props
- How to build a chip/tag input for hashtags with array state
- How to save a newly created post (and new comments) to `AsyncStorage`
- How to give the user feedback with toast messages

## How to run

```bash
cd session4-forms-modals
npm install
npx expo start --clear
```

Press `i` for iOS simulator, `a` for Android, or `w` for the browser.

## Project structure

```
session4-forms-modals/
  app/
    _layout.tsx          Root Stack navigator + <Toast /> host
    postDetails/[id].tsx Post detail screen — shows and adds comments
    (tabs)/
      _layout.tsx        3 bottom tabs
      index.tsx          Home — floating + button opens the post form, list persists to AsyncStorage
      profilePage.tsx    Signed-in profile — sign out / clear all local data
      authenticationPage.tsx  Sign up / sign in form (accounts saved in AsyncStorage)
  components/
    Post.tsx             Post card (links to the detail screen)
    PostForm.tsx         New — full-screen modal form for creating a post
    CommentsSection.tsx  New — comment list + "add comment" button, owns the popup state
    CommentModal.tsx     New — small centered dialog for typing one comment
    Spacer.tsx           Space helper
  utils/
    postData.ts          PostData interface (now includes comments)
    dummyPostData.ts     Seed posts used the first time storage is empty
    userData.ts          Account + session helpers (sign up / sign in / clear)
  examples/              Standalone live-coding demos (not imported by the app)
    modal-basics/        Confirmation dialog — Modal props explained on their own
    chip-input/          The hashtag chip pattern extracted and taught on its own
  assignment/            Session 4 assignment — delete a post with a confirmation modal
```

## Key concepts

### Controlled inputs

A **controlled input** stores its value in `useState` — React owns the value:

```tsx
const [title, setTitle] = useState("");

<TextInput
  value={title}
  onChangeText={setTitle}
  placeholder="Title"
/>
```

### Validation

Check the value on submit and keep an error string in state:

```tsx
function handleSubmit() {
  if (!title.trim()) {
    setTitleError("Title is required.");
    return;
  }
  onSubmit({ title, description, ... });
}
```

### Modal

`Modal` renders content on top of everything else. This session uses two styles:

```tsx
// Full-screen sheet — PostForm
<Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
  ...
</Modal>

// Small centered dialog over a dimmed backdrop — CommentModal
<Modal visible={visible} transparent animationType="fade">
  <View style={styles.backdrop}>
    <View style={styles.dialog}>...</View>
  </View>
</Modal>
```

`onRequestClose` fires on the Android back button and swipe-to-dismiss — always handle it.

### Callback props

The parent passes a function down to the child. The child calls it when done:

```tsx
// Parent
<PostForm onSubmit={(post) => handleNewPost(post)} />

// Child
onSubmit({ title, description, ... });
```

`CommentsSection` and `CommentModal` chain this: the screen passes `onAddComment`
down to `CommentsSection`, which passes `onAdd` down to `CommentModal`.

### Chip / tag input

Hashtags are stored as an array in state, then joined into a string on submit:

```tsx
const [chips, setChips] = useState<string[]>([]);

setChips((prev) => [...prev, tag]);                 // add
setChips((prev) => prev.filter((t) => t !== tag));  // remove
hashtags: chips.map((t) => `#${t}`).join(" ");      // final stored value
```

### Persisting created data

New posts and new comments are written straight back to `AsyncStorage` under
`"tds200_posts"`, so they survive an app restart. The list is seeded from
`dummyPostData` only when storage is empty.

### Toast feedback

`react-native-toast-message` shows a short banner after an action. `<Toast />`
is rendered once in `app/_layout.tsx`; anywhere else calls `Toast.show(...)`.

## What changed from Session 3

| File | Change |
|---|---|
| `app/(tabs)/index.tsx` | Floating + button + `PostForm` modal; new posts saved to `AsyncStorage` |
| `app/postDetails/[id].tsx` | Added a comments section; new comments saved to `AsyncStorage` |
| `components/PostForm.tsx` | New — form with validation and hashtag chips |
| `components/CommentsSection.tsx` | New — comment list and add button |
| `components/CommentModal.tsx` | New — centered dialog for one comment |
| `utils/postData.ts` | `PostData` now has a `comments` array |
| `package.json` | Added `react-native-toast-message` |

## Examples and assignment

- `examples/modal-basics/` and `examples/chip-input/` are standalone demos for
  live coding. Each has its own `README.md` and `live-coding-steps.md`.
- `assignment/ASSIGNMENT.md` — add a delete button and a confirmation modal.
  A reference solution is in `assignment/solution/`.

## What is NOT in this session (on purpose)

| Feature | Introduced in |
|---|---|
| Firebase / Firestore database | Session 5 |
| Real-time list updates (`onSnapshot`) | Session 5 |
| Image upload | Session 7 |
| Real authentication + Context | Session 8 |
| NativeWind styling | Session 10 |

The sign up / sign in here is a local-only teaching version backed by
`AsyncStorage` — it is replaced by real auth in Session 8.
