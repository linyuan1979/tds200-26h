import { PostData } from "./postData";

const posts: PostData[] = [
  {
    id: "p1",
    title: "Welcome to TDS200",
    description: "This is the first session. We are setting up the project.",
    hashtags: "#expo #reactnative",
    author: "Læreren",
    comments: [],
  },
  {
    id: "p2",
    title: "React Native is cross-platform",
    description: "One codebase runs on iOS, Android, and the web.",
    hashtags: "#crossplatform #mobile",
    author: "Ola Nordmann",
    comments: [],
  },
  {
    id: "p3",
    title: "Expo makes it easy",
    description: "Expo gives us tools, libraries, and a dev server out of the box.",
    hashtags: "#expo #tools",
    author: "Kari Hansen",
    comments: [],
  },
  {
    id: "p4",
    title: "File-based routing with Expo Router",
    description: "Each file in the app/ folder becomes a screen automatically.",
    hashtags: "#exporouter #navigation",
    author: "Ola Nordmann",
    comments: [],
  },
  {
    id: "p5",
    title: "TypeScript keeps our code safe",
    description: "We define types so the editor catches mistakes before we run the app.",
    hashtags: "#typescript #types",
    author: "Kari Hansen",
    comments: [],
  },
];

export const getAllPosts = (): PostData[] => posts;

export const getPostById = (id: string): PostData | undefined =>
  posts.find((post) => post.id === id);
