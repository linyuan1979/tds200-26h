import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import React from "react";
import { auth } from "@/firebaseConfig";

// The shape of data every component can read from the context
type AuthContextType = {
  user: User | null;
  loading: boolean;
};

// createContext sets the default value used when there is no Provider above the component.
// In practice, all components live inside AuthProvider so these defaults are never used.
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// AuthProvider wraps the app and keeps auth state in one place.
// Every component inside it can call useAuth() instead of reading auth.currentUser directly.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged fires once on startup (after Firebase reads the persisted session
    // from AsyncStorage on iOS or localStorage on web) and again on every sign-in / sign-out.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth is the custom hook components use to access the current user and loading state.
// Usage: const { user, loading } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
