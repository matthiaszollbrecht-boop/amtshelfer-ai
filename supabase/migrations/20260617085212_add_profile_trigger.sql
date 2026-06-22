-- Auto-create profile when a new user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, language, is_premium, analyses_used)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 'de', FALSE, 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow profiles to be read by the owning user even during insert race
-- (trigger runs as SECURITY DEFINER so it bypasses RLS - no additional policy needed)
