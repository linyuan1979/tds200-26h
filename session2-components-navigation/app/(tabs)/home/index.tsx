import { FlatList, View, StyleSheet } from "react-native";
import React from "react";
import { getAllPosts } from "@/utils/dummyPostData";
import Post from "@/components/Post";
import Spacer from "@/components/Spacer";

// getAllPosts() returns a static array — no useState needed here.
// In Session 5 we will replace this with a real database call.
export default function HomeScreen() {
  const posts = getAllPosts();

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => <Spacer height={8} />}
        ListFooterComponent={() => <Spacer height={40} />}
        ItemSeparatorComponent={() => <Spacer height={12} />}
        renderItem={({ item }) => <Post postData={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  list: {
    paddingHorizontal: 16,
  },
});
