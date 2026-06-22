-- Make document_id nullable so reminders can exist without a linked document
ALTER TABLE public.deadlines
  ALTER COLUMN document_id DROP NOT NULL;

-- Add updated_at for tracking edits
ALTER TABLE public.deadlines
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
