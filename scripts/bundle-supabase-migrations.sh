#!/usr/bin/env bash
# Concatenate all SQL migrations in lexical order for pasting into the Supabase SQL Editor
# when `npm run db:push` is not available (e.g. CLI not linked in this environment).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/supabase/BUNDLE_migrations_for_sql_editor.sql"
{
  echo "-- Roofmate: all migrations concatenated in filename order."
  echo "-- Paste into Supabase → SQL Editor → New query → Run."
  echo "-- Prefer \`npm run db:push\` when the project is linked (\`npm run db:link\`)."
  echo ""
} >"$OUT"
for f in $(ls "${ROOT}/supabase/migrations/"*.sql 2>/dev/null | LC_ALL=C sort); do
  echo "" >>"$OUT"
  echo "-- ========== $(basename "$f") ==========" >>"$OUT"
  cat "$f" >>"$OUT"
  echo "" >>"$OUT"
done
echo "Wrote ${OUT}"
