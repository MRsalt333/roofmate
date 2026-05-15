# Agent / automation (Cursor)

- Prefer **implementing** fixes and **running** allowed commands (install, lint, typecheck, Supabase CLI, migrations) over only suggesting steps. Remote DB access still needs your login/credentials where the tool cannot reach it.
- After migration changes: run **`npm run db:push`** when the Supabase CLI is linked; if push is not possible, run **`npm run db:sql-bundle`** and paste **`supabase/BUNDLE_migrations_for_sql_editor.sql`** into the Supabase SQL Editor (see `.cursor/rules/agent-execution.mdc`).

#Core logic
- This is a roofing estimator app for contractors
- The app must always prioritise speed and simplicity
- Users should be able to generate a quote in under 60 seconds
- Always use Supabase for backend
- Keep logic clean and modular

#UI Rules
- Mobile-first design
- Large buttons (minimum 44px height)
- Minimal steps to complete a quote
- Avoid clutter
- Use clean Tailwind styling
- Prioritise one-hand usability