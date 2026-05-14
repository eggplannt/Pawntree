-- ─── Review cards ─────────────────────────────────────────────────────────────
-- One per (user, node), created lazily on first encounter
CREATE TABLE IF NOT EXISTS public.review_cards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id       UUID NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  interval      INTEGER NOT NULL DEFAULT 1,
  ease_factor   NUMERIC(4,2) NOT NULL DEFAULT 2.5,
  repetitions   INTEGER NOT NULL DEFAULT 0,
  due_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed TIMESTAMPTZ,
  UNIQUE(user_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_review_cards_due ON public.review_cards(user_id, due_date);

ALTER TABLE public.review_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_cards_select"
  ON public.review_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "review_cards_insert"
  ON public.review_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_cards_update"
  ON public.review_cards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_cards_delete"
  ON public.review_cards FOR DELETE
  USING (auth.uid() = user_id);
