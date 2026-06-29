
REVOKE ALL ON FUNCTION public.can_access_farm(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_farm(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.can_manage_farm(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_farm(uuid) TO authenticated, service_role;
