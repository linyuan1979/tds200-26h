export interface PostData {
  id: string;
  title: string;
  description: string;
  hashtags: string;
  author: string;
  comments: { author: string; text: string }[];
}
