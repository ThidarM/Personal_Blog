export interface Article {
  id: string;
  title: string;
  content: string;
  publishDate: string; // stored as YYYY-MM-DD
}

export type ViewType = 
  | { name: "home" }
  | { name: "article"; articleId: string }
  | { name: "admin" }
  | { name: "new" }
  | { name: "edit"; articleId: string };
