import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogleIdToken,
  getSignInErrorMessage,
  getSignUpErrorMessage,
} from "../api/authApi";

type Mode = "signIn" | "signUp";

export default function AuthScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to home once signed in (covers both email and Google flows).
  useEffect(() => {
    if (user) router.replace("/");
  }, [user]);

  const [mode, setMode] = useState<Mode>("signIn");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

  // iOS redirect URI: reverse the client ID dots and append :/ to form a custom URL scheme.
  // e.g. "12345-abc.apps.googleusercontent.com" → "com.googleusercontent.apps.12345-abc:/"
  const iosRedirectUri = iosClientId
    ? makeRedirectUri({ native: iosClientId.split(".").reverse().join(".") + ":/" })
    : undefined;

  // Web:  id_token implicit flow — popup redirects to /redirect, which posts GOOGLE_AUTH_SUCCESS.
  // iOS:  code flow (PKCE) — hook auto-exchanges the code; idToken in response.authentication.
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: webClientId,
    iosClientId: iosClientId,
    redirectUri: Platform.OS === "web" ? "http://127.0.0.1:8081/redirect" : iosRedirectUri,
    responseType: Platform.OS === "web" ? "id_token" : "code",
    scopes: ["openid", "profile", "email"],
    extraParams: { prompt: "select_account" },
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  // Web: listener must be attached on mount, before the popup sends the message.
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handlePopupMessage = (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && event.data.idToken) {
        signInWithGoogleIdToken(event.data.idToken).catch(() =>
          showToast("Google sign-in failed.")
        );
      }
    };

    window.addEventListener("message", handlePopupMessage);
    return () => window.removeEventListener("message", handlePopupMessage);
  }, []);

  // iOS: hook auto-exchanges the code; idToken is in response.authentication.
  useEffect(() => {
    if (response?.type !== "success") return;
    if (Platform.OS === "web") return;

    const idToken = response.authentication?.idToken;
    if (idToken) {
      signInWithGoogleIdToken(idToken).catch(() => showToast("Google sign-in failed."));
    } else {
      showToast("Google sign-in failed: no id_token");
    }
  }, [response]);

  function switchMode(next: Mode) {
    setMode(next);
    setEmail("");
    setPassword("");
    setName("");
    setToast(null);
  }

  async function handleSignIn() {
    if (!email.trim() || !password) {
      showToast("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (e: any) {
      showToast(getSignInErrorMessage(e.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    if (!name.trim()) { showToast("Please enter your name."); return; }
    if (!email.trim()) { showToast("Please enter your email."); return; }
    if (password.length < 6) { showToast("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, name.trim());
    } catch (e: any) {
      showToast(getSignUpErrorMessage(e.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {toast !== null && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}

        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === "signIn" && styles.toggleBtnActive]}
            onPress={() => switchMode("signIn")}
          >
            <Text style={[styles.toggleText, mode === "signIn" && styles.toggleTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === "signUp" && styles.toggleBtnActive]}
            onPress={() => switchMode("signUp")}
          >
            <Text style={[styles.toggleText, mode === "signUp" && styles.toggleTextActive]}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subheading}>
          {mode === "signIn" ? "Welcome back to Postify" : "Join Postify and start sharing"}
        </Text>

        {mode === "signUp" && (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your display name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
              autoFocus
            />
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder={mode === "signUp" ? "At least 6 characters" : "••••••••"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === "signUp" ? "new-password" : "current-password"}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={mode === "signIn" ? handleSignIn : handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === "signIn" ? "Sign In" : "Create Account"}
            </Text>
          )}
        </TouchableOpacity>

        {mode === "signIn" && (
          <>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity
              style={[styles.googleButton, !request && styles.buttonDisabled]}
              onPress={() => promptAsync({ prompt: "select_account" } as any)}
              disabled={!request}
            >
              <Text style={styles.googleButtonText}>🔵  Sign in with Google</Text>
            </TouchableOpacity>
            <Text style={styles.googleNote}>
              Requires EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID + EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in .env
            </Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  scroll: { padding: 24, paddingTop: 60 },
  toast: { backgroundColor: "#333", borderRadius: 10, padding: 14, marginBottom: 16 },
  toastText: { color: "white", fontSize: 14, textAlign: "center" },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: "white" },
  toggleText: { fontSize: 14, fontWeight: "500", color: "gray" },
  toggleTextActive: { color: "#007AFF", fontWeight: "700" },
  subheading: { fontSize: 14, color: "gray", marginBottom: 24 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "gray",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e0e0e0" },
  dividerLabel: { marginHorizontal: 12, color: "gray", fontSize: 13 },
  googleButton: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 6,
  },
  googleButtonText: { fontSize: 16, fontWeight: "500", color: "#333" },
  googleNote: { fontSize: 11, color: "#aaa", textAlign: "center" },
});
