import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "@/firebaseConfig";
import React from "react";

export default function AuthStateObserverDemo() {
  // undefined = Firebase hasn't answered yet (loading)
  // null      = Firebase answered: nobody is signed in
  // User      = Firebase answered: this person is signed in
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [events, setEvents] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Register the listener once. Firebase calls it immediately with the
    // persisted session (or null), then again on every sign-in / sign-out.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      const entry = firebaseUser
        ? `✅ signed in — ${firebaseUser.email} (uid: ${firebaseUser.uid.slice(0, 8)}…)`
        : "❌ signed out — user is null";

      setEvents((prev) => [entry, ...prev]);
    });

    // Return the unsubscribe function so the listener stops when the
    // component unmounts. Without this, the listener leaks.
    return unsubscribe;
  }, []);

  async function handleSignIn() {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setEmail("");
      setPassword("");
    } catch (e: any) {
      setError(e.code ?? "Sign-in failed");
    }
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>onAuthStateChanged — live demo</Text>
      <Text style={styles.subheading}>
        Sign in or out and watch the observer fire in real time.
      </Text>

      {/* ── Current state ─────────────────────────────────────── */}
      <View style={styles.stateBox}>
        <Text style={styles.stateLabel}>Current user value:</Text>
        {user === undefined && (
          <Text style={styles.stateValue}>undefined — Firebase is loading…</Text>
        )}
        {user === null && (
          <Text style={[styles.stateValue, styles.null]}>null — not signed in</Text>
        )}
        {user != null && (
          <View>
            <Text style={[styles.stateValue, styles.signedIn]}>User object ✓</Text>
            <Text style={styles.userField}>email: {user.email}</Text>
            <Text style={styles.userField}>displayName: {user.displayName ?? "(none)"}</Text>
            <Text style={styles.userField}>uid: {user.uid}</Text>
          </View>
        )}
      </View>

      {/* ── Controls ──────────────────────────────────────────── */}
      {!user ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.btn} onPress={handleSignIn}>
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.btn, styles.signOutBtn]} onPress={handleSignOut}>
          <Text style={styles.btnText}>Sign Out</Text>
        </TouchableOpacity>
      )}

      {/* ── Event log ─────────────────────────────────────────── */}
      <Text style={styles.logHeading}>Observer events (newest first)</Text>
      {events.length === 0 && (
        <Text style={styles.logEmpty}>No events yet — waiting for Firebase…</Text>
      )}
      {events.map((entry, i) => (
        <Text key={i} style={styles.logEntry}>
          {entry}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, backgroundColor: "#f2f2f7" },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  subheading: { fontSize: 14, color: "gray", marginBottom: 24 },

  stateBox: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  stateLabel: { color: "#8e8e93", fontSize: 12, marginBottom: 8, textTransform: "uppercase" },
  stateValue: { color: "white", fontSize: 14, fontFamily: "monospace" },
  null: { color: "#ff9f0a" },
  signedIn: { color: "#30d158", marginBottom: 8 },
  userField: { color: "#ebebf5", fontSize: 13, fontFamily: "monospace", marginTop: 2 },

  form: { marginBottom: 24 },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  error: { color: "#FF3B30", fontSize: 13, marginBottom: 8 },
  btn: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  signOutBtn: { backgroundColor: "#FF3B30" },
  btnText: { color: "white", fontWeight: "600", fontSize: 16 },

  logHeading: {
    fontSize: 13,
    fontWeight: "600",
    color: "gray",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  logEmpty: { color: "#aaa", fontSize: 14, fontStyle: "italic" },
  logEntry: {
    fontSize: 13,
    color: "#333",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
});
