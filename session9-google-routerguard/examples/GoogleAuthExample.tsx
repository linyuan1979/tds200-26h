/**
 * GoogleAuthExample.tsx
 *
 * A self-contained Google sign-in screen — no email/password, just Google.
 *
 * How it works:
 *   iOS  — expo-auth-session opens a browser, exchanges the code for an idToken,
 *           and returns it directly in `response.authentication.idToken`.
 *
 *   Web  — expo-auth-session opens a popup. The popup lands on /redirect,
 *           which calls signInWithGoogleIdToken() and posts GOOGLE_AUTH_SUCCESS
 *           back to this window. We listen for that message here.
 *
 * Prerequisites:
 *   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID  in .env
 *   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID  in .env  (iOS only)
 */

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { signInWithGoogleIdToken } from "@/api/authApi";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// iOS: reverse the client ID to build the custom URL scheme
// e.g. "12345-abc.apps.googleusercontent.com" → "com.googleusercontent.apps.12345-abc:/"
const iosRedirectUri = iosClientId
  ? makeRedirectUri({ native: iosClientId.split(".").reverse().join(".") + ":/" })
  : undefined;

export default function GoogleAuthExample() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading
  const [error, setError] = useState<string | null>(null);

  // Step 1: prepare the auth request
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId,
    iosClientId,
    redirectUri: Platform.OS === "web" ? "http://127.0.0.1:8081/redirect" : iosRedirectUri,
    responseType: Platform.OS === "web" ? "id_token" : "code",
    scopes: ["openid", "profile", "email"],
  });

  // Step 2: keep user in sync with Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  // Step 3a (iOS): hook gives back the idToken directly after the browser flow
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (response?.type !== "success") return;
    const idToken = response.authentication?.idToken;
    if (idToken) {
      signInWithGoogleIdToken(idToken).catch(() => setError("Google sign-in failed."));
    }
  }, [response]);

  // Step 3b (Web): popup posts GOOGLE_AUTH_SUCCESS — we sign in from here
  useEffect(() => {
    if (Platform.OS !== "web") return;
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data.idToken) {
        signInWithGoogleIdToken(event.data.idToken).catch(() =>
          setError("Google sign-in failed.")
        );
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (user === undefined) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.center}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>
            {(user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.displayName ?? "No name"}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.uid}>uid: {user.uid.slice(0, 12)}…</Text>

        <TouchableOpacity style={styles.signOutBtn} onPress={() => signOut(auth)}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Google Sign-In</Text>
      <Text style={styles.subtitle}>Simplified single-file example</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.googleBtn, !request && styles.disabled]}
        onPress={() => {
          setError(null);
          promptAsync();
        }}
        disabled={!request}
      >
        <Text style={styles.googleBtnText}>Sign in with Google</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Requires EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID{"\n"}
        and EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in .env
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarLetter: { color: "white", fontSize: 32, fontWeight: "bold" },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  email: { fontSize: 15, color: "gray", marginBottom: 4 },
  uid: { fontSize: 11, color: "#bbb", marginBottom: 32 },
  signOutBtn: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  signOutText: { color: "white", fontWeight: "600", fontSize: 15 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "gray", marginBottom: 32 },
  error: { color: "#FF3B30", marginBottom: 16, textAlign: "center" },
  googleBtn: {
    backgroundColor: "#4285F4",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  disabled: { opacity: 0.4 },
  googleBtnText: { color: "white", fontWeight: "600", fontSize: 16 },
  note: { fontSize: 11, color: "#aaa", textAlign: "center", lineHeight: 17 },
});
