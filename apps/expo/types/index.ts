export interface User {
  id: string;
  email: string;
  display_name: string | null;
  oauth_provider: string;
  created_at: string;
}

export interface Opening {
  id: string;
  user_id: string;
  name: string;
  color: 'white' | 'black';
  description: string | null;
  created_at: string;
}

export interface Node {
  id: string;
  opening_id: string;
  parent_id: string | null;
  move_san: string | null;
  move_uci: string | null;
  fen: string;
  annotation: string | null;
  sort_order: number;
  created_at: string;
  children?: Node[];
}

export interface ReviewCard {
  id: string;
  user_id: string;
  node_id: string;
  interval: number;
  ease_factor: number;
  repetitions: number;
  due_date: string;
  last_reviewed: string | null;
  node?: Node;
  opening?: Opening;
}
