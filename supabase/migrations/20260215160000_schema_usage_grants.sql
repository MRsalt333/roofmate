-- Some projects lack USAGE on schema public for the authenticated role, which breaks all DML
-- with "permission denied for schema public" before RLS runs.

grant usage on schema public to authenticated, service_role;
