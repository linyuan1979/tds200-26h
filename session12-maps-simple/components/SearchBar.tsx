// Local search bar — filters the already-loaded posts array in memory.
//
// "Local query" means the filtering happens on the client after the data is fetched.
// No extra network request is made when the user types — React just re-renders
// with a filtered slice of the posts array.
//
// Contrast with the "My Posts" remote query in index.tsx, which sends a
// Firestore where() query to the server and only receives matching documents.

import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChangeText, placeholder = "Search posts…" }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        clearButtonMode="while-editing"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={() => onChangeText("")}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    height: 40,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 13,
    color: "#999",
  },
});
