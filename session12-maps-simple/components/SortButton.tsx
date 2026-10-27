import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

type SortOrder = "asc" | "desc";

type Props = {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
};

const LABELS: Record<SortOrder, string> = {
  desc: "Newest first",
  asc: "Oldest first",
};

// Tapping the button flips the order — one button, two states.
const NEXT: Record<SortOrder, SortOrder> = {
  desc: "asc",
  asc: "desc",
};

export default function SortButton({ value, onChange }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={() => onChange(NEXT[value])}>
      <Text style={styles.text}>{LABELS[value]}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  text: { fontSize: 13, fontWeight: "600", color: "#333" },
});
