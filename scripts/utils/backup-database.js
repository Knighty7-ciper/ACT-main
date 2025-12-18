#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}
const out = path.join(process.cwd(), `db-backup-${Date.now()}.sql`);
const res = spawnSync('bash', ['-lc', `pg_dump '${url}' > '${out}'`], { stdio: 'inherit' });
process.exit(res.status || 0);
