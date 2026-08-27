import AsyncStorage from "@react-native-async-storage/async-storage";

// The USERS_KEY holds an ARRAY of users, so we can store many accounts.
export const USERS_KEY = "tds200_users";

// The current session user
export const SESSION_USER = "tds200_session_user";

export interface UserData {
  name: string;
  email: string;
  // For teaching piurpose only. A real app never stores a plain-text password
  // on the device — it sends it to a server over HTTPS.
  password: string;
}

// The signed-in user. No password here.
export interface SessionUser {
  name: string;
  email: string;
}

// Get all saved accounts. Returns [] when nothing is stored yet.
export async function getUsers(): Promise<UserData[]> {
  const stored = await AsyncStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Add a new account to the list and save it back.
export async function addUser(user: UserData): Promise<void> {
  const users = await getUsers();
  const updated = [...users, user];
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
}

// Find an account by email 
export async function findUserByEmail(email: string): Promise<UserData | undefined> {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}


// Wipe EVERYTHING this app saved
export async function clearAllStorage(): Promise<void> {
  await AsyncStorage.clear();
}