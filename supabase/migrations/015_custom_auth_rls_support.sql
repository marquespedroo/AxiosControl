-- ===================================
-- MIGRATION 015: Custom Auth RLS Support
-- Enable RLS with custom JWT authentication (not Supabase Auth)
-- ===================================

-- ===================================
-- 1. CREATE CONTEXT FUNCTIONS
-- ===================================

-- Function to set RLS context for custom auth
CREATE OR REPLACE FUNCTION public.set_rls_context(
  p_user_id UUID,
  p_clinica_id UUID
) RETURNS void AS $$
BEGIN
  -- Set session variables that RLS policies will check
  PERFORM set_config('app.current_user_id', p_user_id::TEXT, false);
  PERFORM set_config('app.current_clinica_id', p_clinica_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear RLS context
CREATE OR REPLACE FUNCTION public.clear_rls_context() RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', false);
  PERFORM set_config('app.current_clinica_id', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current clinic ID (works with both Supabase Auth and custom auth)
CREATE OR REPLACE FUNCTION public.current_clinica_id()
RETURNS UUID AS $$
DECLARE
  v_clinica_id UUID;
  v_custom_clinica TEXT;
BEGIN
  -- First, try to get from custom auth context
  v_custom_clinica := current_setting('app.current_clinica_id', true);
  IF v_custom_clinica IS NOT NULL AND v_custom_clinica != '' THEN
    RETURN v_custom_clinica::UUID;
  END IF;

  -- Fallback to Supabase Auth (auth.uid())
  SELECT clinica_id INTO v_clinica_id
  FROM public.psicologos
  WHERE id = auth.uid();

  RETURN v_clinica_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get current user ID (works with both Supabase Auth and custom auth)
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
DECLARE
  v_custom_user TEXT;
BEGIN
  -- First, try to get from custom auth context
  v_custom_user := current_setting('app.current_user_id', true);
  IF v_custom_user IS NOT NULL AND v_custom_user != '' THEN
    RETURN v_custom_user::UUID;
  END IF;

  -- Fallback to Supabase Auth
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update user_clinica_id to use the new function
CREATE OR REPLACE FUNCTION public.user_clinica_id()
RETURNS UUID AS $$
BEGIN
  RETURN public.current_clinica_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.set_rls_context IS 'Set RLS context for custom JWT auth';
COMMENT ON FUNCTION public.clear_rls_context IS 'Clear RLS context after operation';
COMMENT ON FUNCTION public.current_clinica_id IS 'Get current clinica_id from custom auth or Supabase Auth';
COMMENT ON FUNCTION public.current_user_id IS 'Get current user_id from custom auth or Supabase Auth';

-- ===================================
-- 2. GRANT EXECUTE PERMISSIONS
-- ===================================

GRANT EXECUTE ON FUNCTION public.set_rls_context(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_rls_context(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_rls_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_rls_context() TO service_role;
GRANT EXECUTE ON FUNCTION public.current_clinica_id() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_id() TO authenticated, anon, service_role;

-- ===================================
-- END OF MIGRATION
-- ===================================
