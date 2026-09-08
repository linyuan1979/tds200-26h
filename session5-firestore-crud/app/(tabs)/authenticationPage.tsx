import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import React from "react";
import {
  SESSION_USER,
  UserData,
  SessionUser,
  addUser,
  findUserByEmail,
} from "@/utils/userData";

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function isValidEmail(email: string): boolean {
  return (
    email.includes("@") &&
    email.includes(".") &&
    !email.includes(" ")
  );
}

// Every validation problem is shown the same way: a red Toast at the top.
function showError(message: string) {
  Toast.show({ type: "error", text1: message });
}

export default function AuthenticationPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  // Empty every field. We call this after switching modes and after a
  // successful sign up / sign in so old text doesn't stay on screen.
  function clearForm() {
    setName("");
    setEmail("");
    setPassword("");
  }

  async function handleSignUp() {
    if (!name.trim()) {
      showError("Name is required.");
      return;
    }
    if (!isValidEmail(email.trim())) {
      showError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    await delay(1000); // Simulate a network request

    // One email can only be used once.
    const existing = await findUserByEmail(email.trim());
    if (existing) {
      setLoading(false);
      showError("An account with this email already exists.");
      return;
    }

    const user: UserData = {
      name: name.trim(),
      email: email.trim(),
      password,
    };
    // Add the account to the saved list. On web this ends up in the
    // browser's localStorage; on a device it uses native storage.
    await addUser(user);
    setLoading(false);

    clearForm();
    setIsSignUp(false); // send them to the Sign in form
    Toast.show({ type: "success", text1: "Account created! Now sign in." });
  }

  async function handleSignIn() {
    if (!isValidEmail(email.trim())) {
      showError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      showError("Password is required.");
      return;
    }

    setLoading(true);
    await delay(1000); // Simulate a network request
    const user = await findUserByEmail(email.trim());
    setLoading(false);

    if (!user) {
      showError("No account found. Please sign up first.");
      return;
    }

    if (user.password !== password) {
      showError("Incorrect email or password.");
      return;
    }

    // Mark this user as signed in. The Profile tab reads SESSION_USER,
    // so the profile only shows up after a successful sign in.
    const sessionUser: SessionUser = { name: user.name, email: user.email };
    await AsyncStorage.setItem(SESSION_USER, JSON.stringify(sessionUser));

    clearForm();
    Toast.show({ type: "success", text1: `Welcome back, ${user.name}! Open the Profile tab.` });
  }

  return (
    <View
      style={styles.container}
    >
      <Text style={styles.heading}>{isSignUp ? "Create account" : "Sign in"}</Text>
      <Text style={styles.subheading}>Your details are saved locally on this device.</Text>

      {/* Toggle between the two modes */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleButton, isSignUp && styles.toggleButtonActive]}
          onPress={() => {
            setIsSignUp(true);
            clearForm();
          }}
        >
          <Text style={[styles.toggleText, isSignUp && styles.toggleTextActive]}>
            Sign up
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !isSignUp && styles.toggleButtonActive]}
          onPress={() => {
            setIsSignUp(false);
            clearForm();
          }}
        >
          <Text style={[styles.toggleText, !isSignUp && styles.toggleTextActive]}>
            Sign in
          </Text>
        </TouchableOpacity>
      </View>

      {/* Name is only needed when creating an account */}
      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Your email"
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
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={isSignUp ? handleSignUp : handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>{isSignUp ? "Create account" : "Sign in"}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f2f2f7",
  },
  heading: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  subheading: { fontSize: 13, color: "gray", marginBottom: 24 },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#e4e4ea",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "white",
  },
  toggleText: { fontSize: 15, fontWeight: "600", color: "gray" },
  toggleTextActive: { color: "#007AFF" },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});
