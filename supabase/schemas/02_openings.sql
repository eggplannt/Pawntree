-- ─── Openings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.openings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL CHECK (color IN ('white', 'black')),
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.openings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "openings_select"
  ON public.openings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "openings_insert"
  ON public.openings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "openings_update"
  ON public.openings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "openings_delete"
  ON public.openings FOR DELETE
  USING (auth.uid() = user_id);
