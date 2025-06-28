export type Document = {
  id: string;
  user_id?: string;
  content: string;
  embedding?: number[];
  createdAt?: string;
  updatedAt?: string;
};
