import AsyncStorage from "@react-native-async-storage/async-storage";

// The list of accounts the students created (sign up).
// One key holds an ARRAY of users, so we can store many accounts.
export const USERS_KEY = "tds200_users";

// Who is currently signed in. Written on sign in, removed on sign out.
// The Profile tab reads THIS key, so it only shows a signed-in user.
export const SESSION_USER = "tds200_session_user";

export interface UserData {
  name: string;
  email: string;
  // For teaching only. A real app never stores a plain-text password
  // on the device — it sends it to a server over HTTPS.
  password: string;
}

// What we keep about the signed-in user. No password here.
export interface SessionUser {
  name: string;
  email: string;
}

// Read every saved account. Returns [] when nothing is stored yet.
export async function getUsers(): Promise<UserData[]> {
  const stored = await AsyncStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Add one account to the list and save it back.
// The new user is concatenated onto the existing array.
export async function addUser(user: UserData): Promise<void> {
  const users = await getUsers();
  const updated = [...users, user];
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
}

// Find an account by email (case-insensitive). Returns undefined if none.
export async function findUserByEmail(email: string): Promise<UserData | undefined> {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Wipe EVERYTHING this app saved: every account, the signed-in session,
// and any other keys (like the liked posts on the Home tab).
// On web this empties the browser's localStorage for this app.
export async function clearAllStorage(): Promise<void> {
  await AsyncStorage.clear();
}
