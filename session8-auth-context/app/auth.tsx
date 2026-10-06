import { useState } from "react";
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
import React from "react";
import {
  signInWithEmail,
  signUpWithEmail,
  getSignInErrorMessage,
  getSignUpErrorMessage,
} from "../api/authApi";

type Mode = "signIn" | "signUp";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signIn");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

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
              Sign Up
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
              {mode === "signIn" ? "Sign In" : "Sign Up"}
            </Text>
          )}
        </TouchableOpacity>
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
});
