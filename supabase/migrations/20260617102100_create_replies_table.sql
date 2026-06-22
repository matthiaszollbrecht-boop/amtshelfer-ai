CREATE TABLE public.replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reply_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_replies" ON public.replies FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_replies" ON public.replies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_replies" ON public.replies FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_replies" ON public.replies FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_replies_document_id ON public.replies(document_id);
CREATE INDEX idx_replies_user_id ON public.replies(user_id);
