import { supabase } from "@/integrations/supabase/client";
import type { QueryClient } from "@tanstack/react-query";

/**
 * Sign-out hygiene: cancel queries → clear cache → signOut → caller navigates.
 * Always replace history to /auth so Back doesn't restore protected state.
 */
export async function signOutCleanly(queryClient: QueryClient) {
  await queryClient.cancelQueries();
  queryClient.clear();
  await supabase.auth.signOut();
}
