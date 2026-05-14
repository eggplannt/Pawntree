-- Users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  oauth_provider TEXT NOT NULL,
  oauth_id      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(oauth_provider, oauth_id)
);

-- Openings: the root of a named opening tree
CREATE TABLE openings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL CHECK (color IN ('white', 'black')),
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Nodes: every position in the tree
-- Root node: parent_id IS NULL, move_san IS NULL, fen = starting FEN
CREATE TABLE nodes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opening_id  UUID NOT NULL REFERENCES openings(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES nodes(id) ON DELETE CASCADE,
  move_san    TEXT,
  move_uci    TEXT,
  fen         TEXT NOT NULL,
  annotation  TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nodes_opening ON nodes(opening_id);
CREATE INDEX idx_nodes_parent  ON nodes(parent_id);
CREATE INDEX idx_nodes_fen     ON nodes(fen);

-- Review cards: one per (user, node), created lazily on first encounter
CREATE TABLE review_cards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  node_id       UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  interval      INTEGER NOT NULL DEFAULT 1,
  ease_factor   NUMERIC(4,2) NOT NULL DEFAULT 2.5,
  repetitions   INTEGER NOT NULL DEFAULT 0,
  due_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed TIMESTAMPTZ,
  UNIQUE(user_id, node_id)
);

CREATE INDEX idx_review_cards_due ON review_cards(user_id, due_date);
