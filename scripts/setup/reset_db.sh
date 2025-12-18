#!/usr/bin/env bash
set -euo pipefail

if [[ "${NODE_ENV:-development}" == "production" && "${FORCE_DB_RESET:-}" != "true" ]]; then
  echo "Refusing to reset schema in production without FORCE_DB_RESET=true" >&2
  exit 1
fi

DB_URL="${DATABASE_URL:-${POSTGRES_URL:-${POSTGRES_URL_NON_POOLING:-}}}"
if [[ -z "${DB_URL}" ]]; then
  echo "DATABASE_URL/POSTGRES_URL not set" >&2
  exit 1
fi

here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
schema_dir="$root/database/schema"

run() { psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$1"; }

run "$schema_dir/00_extensions.sql"
run "$schema_dir/01_currencies.sql"
run "$schema_dir/02_countries.sql"
run "$schema_dir/03_exchange_rates.sql"
run "$schema_dir/04_users.sql"
run "$schema_dir/05_wallets.sql"
run "$schema_dir/06_transactions.sql"
run "$schema_dir/07_transaction_status_history.sql"
run "$schema_dir/08_news_categories.sql"
run "$schema_dir/09_news.sql"
run "$schema_dir/10_economic_indicators.sql"
run "$schema_dir/11_roles.sql"
run "$schema_dir/12_user_roles.sql"
run "$schema_dir/13_admins.sql"

echo "✓ Schema reset complete"
