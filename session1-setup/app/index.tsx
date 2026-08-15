import { StyleSheet, View, Text, FlatList } from "react-native";
import React from "react";
import { getAllPosts } from "@/utils/dummyPostData";
import { PostData } from "@/utils/postData";

export default function HomeScreen() {
  const posts: PostData[] = getAllPosts();

  return (
    <FlatList
      data={posts}
      keyExtractor={(item: { id: any; }) => item.id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }: { item: PostData }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.footer}>
            <Text style={styles.hashtags}>{item.hashtags}</Text>
            <Text style={styles.author}>{item.author}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "gray",
    marginTop: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  hashtags: {
    fontSize: 12,
    color: "gray",
  },
  author: {
    fontSize: 12,
    color: "gray",
    textDecorationLine: "underline",
  },
});
