#!/usr/bin/env bash
set -euo pipefail

if [[ "${NODE_ENV:-development}" == "production" && "${FORCE_DB_SEED:-}" != "true" ]]; then
  echo "Refusing to seed in production without FORCE_DB_SEED=true" >&2
  exit 1
fi

DB_URL="${DATABASE_URL:-${POSTGRES_URL:-${POSTGRES_URL_NON_POOLING:-}}}"
if [[ -z "${DB_URL}" ]]; then
  echo "DATABASE_URL/POSTGRES_URL not set" >&2
  exit 1
fi

here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
seed_dir="$root/database/seed"

run() { psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$1"; }

run "$seed_dir/01_currencies.seed.sql"
run "$seed_dir/02_countries.seed.sql"
run "$seed_dir/03_exchange_rates.seed.sql"
run "$seed_dir/04_roles.seed.sql"
run "$seed_dir/05_news_categories.seed.sql"
run "$seed_dir/06_users.seed.sql"
run "$seed_dir/07_wallets.seed.sql"
run "$seed_dir/08_transactions.seed.sql"
run "$seed_dir/09_news.seed.sql"
run "$seed_dir/10_economic_indicators.seed.sql"

echo "✓ Seed data applied"
