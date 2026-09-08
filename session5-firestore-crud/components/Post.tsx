import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import React from "react";
import { PostData } from "@/utils/postData";

type PostProps = { postData: PostData };

export default function Post({ postData }: PostProps) {
  return (
    <View style={styles.card}>
      {/*
        asChild passes the Link's navigation to TouchableOpacity instead of
        rendering Link as a Text. This lets title and description stack on
        separate lines instead of running inline.
      */}
      <Link href={{
        pathname: "/postDetails/[id]",
        params: { id: postData.id }
        }}
      asChild>
        <TouchableOpacity>
          <Text style={styles.title}>{postData.title}</Text>
          <Text style={styles.description}>{postData.description}</Text>
        </TouchableOpacity>
      </Link>
      <View style={styles.footer}>
        <Text style={styles.hashtags}>{postData.hashtags}</Text>
        <Text style={styles.author}>{postData.author}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  title: { fontSize: 18, fontWeight: "bold" },
  description: { fontSize: 14, color: "gray", marginTop: 6 },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  hashtags: { fontSize: 12, color: "gray" },
  author: { fontSize: 12, color: "gray", textDecorationLine: "underline" },
});
