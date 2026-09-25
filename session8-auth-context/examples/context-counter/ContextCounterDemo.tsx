import { createContext, useContext, useState, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

// ── Step 1: define the shape of the data the context will hold ────────────
type CounterContextType = {
  count: number;
  increment: () => void;
  reset: () => void;
};

// ── Step 2: create the context with a default value ───────────────────────
// The default is only used if a component calls useContext outside a Provider.
// In practice that shouldn't happen, but TypeScript requires a value here.
const CounterContext = createContext<CounterContextType>({
  count: 0,
  increment: () => {},
  reset: () => {},
});

// ── Step 3: Provider — holds the state and publishes it ───────────────────
function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  return (
    <CounterContext.Provider
      value={{
        count,
        increment: () => setCount((c) => c + 1),
        reset: () => setCount(0),
      }}
    >
      {children}
    </CounterContext.Provider>
  );
}

// ── Step 4: Consumer components — read from context with useContext ────────
// Note: CountDisplay and CountButtons receive NO props from each other.
// They both read independently from CounterContext.

function CountDisplay() {
  const { count } = useContext(CounterContext);
  return (
    <View style={styles.displayBox}>
      <Text style={styles.countNumber}>{count}</Text>
      <Text style={styles.countLabel}>current count</Text>
    </View>
  );
}

function CountButtons() {
  const { increment, reset } = useContext(CounterContext);
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.btn} onPress={increment}>
        <Text style={styles.btnText}>+1</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.resetBtn]} onPress={reset}>
        <Text style={styles.btnText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Root: wrap both consumers in the Provider ─────────────────────────────
export default function ContextCounterDemo() {
  return (
    <CounterProvider>
      <View style={styles.container}>
        <Text style={styles.heading}>React Context — counter demo</Text>
        <Text style={styles.subheading}>
          CountDisplay and CountButtons share state through context.{"\n"}
          No props are passed between them.
        </Text>

        {/* Both components read from the same CounterContext */}
        <CountDisplay />
        <CountButtons />

        <View style={styles.diagram}>
          <Text style={styles.diagramTitle}>How it works</Text>
          <Text style={styles.diagramText}>CounterProvider (holds state)</Text>
          <Text style={styles.diagramText}>  ├── CountDisplay  → reads count</Text>
          <Text style={styles.diagramText}>  └── CountButtons → reads increment, reset</Text>
        </View>
      </View>
    </CounterProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#f2f2f7",
    alignItems: "center",
  },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 8, textAlign: "center" },
  subheading: { fontSize: 14, color: "gray", textAlign: "center", marginBottom: 32, lineHeight: 20 },

  displayBox: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  countNumber: { fontSize: 56, fontWeight: "bold", color: "white" },
  countLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },

  row: { flexDirection: "row", gap: 16, marginBottom: 40 },
  btn: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  resetBtn: { backgroundColor: "#8e8e93" },
  btnText: { color: "white", fontWeight: "600", fontSize: 16 },

  diagram: {
    backgroundColor: "#1c1c1e",
    borderRadius: 12,
    padding: 16,
    width: "100%",
  },
  diagramTitle: {
    color: "#8e8e93",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  diagramText: { color: "#ebebf5", fontSize: 13, fontFamily: "monospace", lineHeight: 22 },
});
