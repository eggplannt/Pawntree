-- ─── Nodes ────────────────────────────────────────────────────────────────────
-- Each position in an opening tree.
-- Root node: parent_id IS NULL, move_san IS NULL, fen = starting FEN
CREATE TABLE IF NOT EXISTS public.nodes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opening_id  UUID NOT NULL REFERENCES public.openings(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES public.nodes(id) ON DELETE CASCADE,
  move_san    TEXT,
  move_uci    TEXT,
  fen         TEXT NOT NULL,
  annotation  TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nodes_opening ON public.nodes(opening_id);
CREATE INDEX IF NOT EXISTS idx_nodes_parent  ON public.nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_nodes_fen     ON public.nodes(fen);

ALTER TABLE public.nodes ENABLE ROW LEVEL SECURITY;

-- Access is gated through opening ownership on all operations
CREATE POLICY "nodes_select"
  ON public.nodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.openings
      WHERE openings.id = nodes.opening_id
        AND openings.user_id = auth.uid()
    )
  );

CREATE POLICY "nodes_insert"
  ON public.nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.openings
      WHERE openings.id = nodes.opening_id
        AND openings.user_id = auth.uid()
    )
  );

CREATE POLICY "nodes_update"
  ON public.nodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.openings
      WHERE openings.id = nodes.opening_id
        AND openings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.openings
      WHERE openings.id = nodes.opening_id
        AND openings.user_id = auth.uid()
    )
  );

CREATE POLICY "nodes_delete"
  ON public.nodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.openings
      WHERE openings.id = nodes.opening_id
        AND openings.user_id = auth.uid()
    )
  );
