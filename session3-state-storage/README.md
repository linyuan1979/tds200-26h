# Session 3 — State and Local Storage

The app now remembers things. Posts and user accounts are saved on the device with **AsyncStorage**, screens keep their data in **state** (`useState`), and feedback is shown with **toast** messages. Sign up and sign in work locally, and the Profile tab shows the signed-in user.

## Features

### Home tab
- On first launch the 5 sample posts are saved to local storage; after that they are read back from storage.
- A loading spinner ("Loading posts…") shows while posts load.
- **Pull down to refresh** reloads the posts from storage. If storage is empty, it saves the sample posts again.
- A red **Clear Posts** button removes the saved posts and empties the list.
- A toast at the top says where the posts came from.
- Tapping a post opens its details.

### Post details
- Shows the title, author, description, and hashtags. An unknown id shows "Post not found."
- The header shows a custom title, "PostDetaljer".

### Sign in tab
- A **Sign up / Sign in** toggle switches between two forms. Switching clears the fields.
- **Sign up** asks for name, email, and password, and checks that:
  - the name is not empty,
  - the email looks valid (contains `@` and `.`, no spaces),
  - the password is at least 6 characters,
  - no account already uses that email (case-insensitive).
- **Sign in** checks the email and password against the saved accounts.
- Both show a spinner on the button during a simulated 1-second delay, and report errors and success with toasts.
- After signing up you are moved to the Sign in form.

### Profile tab
- Signed in: a round avatar with the first letter of your name, your name and email, and a **Sign out** button.
- Signed out: "You are not signed in."
- **Clear all local data** wipes everything the app has saved (posts, accounts, and the signed-in user).

## How to run

```bash
cd session3-state-storage
npm install
npx expo start
```

Press `i` to open the iOS simulator, `a` for Android, or `w` for the browser. On the web, AsyncStorage saves to the browser's `localStorage`.

## Project structure

```
session3-state-storage/
  app/
    _layout.tsx              Root Stack (tabs + post details) and the <Toast /> host
    postDetails/[id].tsx     Details for one post
    (tabs)/
      _layout.tsx            Bottom tabs: Home, Profile, Sign in
      index.tsx              Home: posts from AsyncStorage, refresh, clear
      authenticationPage.tsx Sign up / Sign in forms
      profilePage.tsx        Signed-in user, sign out, clear all data
  components/
    Post.tsx                 Post card; the title and description link to the details
    Spacer.tsx               Empty View with a given height/width
  utils/
    postData.ts              PostData interface
    dummyPostData.ts         5 sample posts, getAllPosts() and getPostById()
    userData.ts              UserData / SessionUser types and AsyncStorage helpers
```

## Key files to read

| File | Why it matters |
|---|---|
| `app/(tabs)/index.tsx` | `useState` + `useEffect` to load data once, `RefreshControl` for pull-to-refresh |
| `app/(tabs)/authenticationPage.tsx` | A controlled form: each `TextInput` is tied to a state variable, with validation |
| `app/(tabs)/profilePage.tsx` | `useFocusEffect` re-reads the signed-in user every time the tab is opened |
| `utils/userData.ts` | Reading, adding, finding, and clearing data in AsyncStorage |
| `app/_layout.tsx` | Where `<Toast />` is placed so toasts can appear on any screen |

## Concepts explained

### State with `useState`
`const [posts, setPosts] = useState<PostData[]>([])` stores a value that belongs to the screen. Calling `setPosts(...)` updates the value and re-renders the screen. This session uses state for the posts list, loading and refreshing flags, form fields, the Sign up / Sign in mode, and the signed-in user.

### Side effects with `useEffect` and `useFocusEffect`
- `useEffect(() => { loadPosts(); }, [])` runs once, when the Home screen first appears.
- `useFocusEffect(useCallback(...))` runs **every time** the Profile tab gets focus. Tabs stay mounted, so a plain `useEffect` wouldn't notice that you just signed in on another tab.

### AsyncStorage
A simple key-value store that keeps data after the app closes. It only stores strings, so objects are saved with `JSON.stringify` and read back with `JSON.parse`. The app uses three keys:

| Key | Holds |
|---|---|
| `tds200_posts` | The list of posts |
| `tds200_users` | An array of all accounts (name, email, password) |
| `tds200_session_user` | The signed-in user (name and email, no password) |

Signing out removes only `tds200_session_user`, so the accounts are kept. **Clear all local data** calls `AsyncStorage.clear()`.

> The password is stored in plain text for teaching only. A real app sends it to a server over HTTPS and never stores it on the device.

### Controlled inputs
Each `TextInput` gets `value={email}` and `onChangeText={setEmail}`, so the state is always the source of truth. That is what makes `clearForm()` work: setting the state to `""` empties the fields.

### Conditional rendering
- `{isSignUp && <TextInput ... />}` only shows the name field in Sign up mode.
- `loading ? <ActivityIndicator /> : <Text>...</Text>` swaps the button text for a spinner.
- An early `return` shows the loading screen or the signed-out screen.

### Toast messages
`react-native-toast-message` shows short messages at the top of the screen: `Toast.show({ type: "success" | "error" | "info", text1: "..." })`. It only works because `<Toast />` is rendered once in the root layout.

### `Link` with `asChild`
In `Post.tsx`, `<Link asChild>` passes the navigation to the `TouchableOpacity` inside it, so the title and description stay on separate lines and the whole area is tappable.
