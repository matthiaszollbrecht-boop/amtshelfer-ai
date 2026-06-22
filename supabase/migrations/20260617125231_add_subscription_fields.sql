-- Add subscription tracking fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_type TEXT CHECK (subscription_type IN ('monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_purchase_token TEXT;

-- Index for expiry lookups
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires ON public.profiles(subscription_expires_at)
  WHERE subscription_expires_at IS NOT NULL;
