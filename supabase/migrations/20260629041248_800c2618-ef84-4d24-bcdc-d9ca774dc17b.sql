
REVOKE EXECUTE ON FUNCTION public.set_updated_at()           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()          FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.owns_farm(uuid)            FROM PUBLIC, anon;
-- has_role / owns_farm remain callable by authenticated since policies reference them as the calling user.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_farm(uuid)            TO authenticated;
