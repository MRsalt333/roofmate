-- Ensure the Supabase "authenticated" role can reach app tables (RLS still applies).
-- Without these grants, inserts/updates fail with "permission denied" even when RLS passes.

grant select, insert, update, delete on table public.quotes to authenticated, service_role;
grant select, insert, update, delete on table public.quote_templates to authenticated, service_role;
grant select, update on table public.profiles to authenticated, service_role;
