#!/usr/bin/env node
const { spawnSync } = require('child_process');

console.log('Running migrations via TypeORM (ensure CLI configured)');
const result = spawnSync('pnpm', ['-C', 'backend', 'typeorm', 'migration:run'], { stdio: 'inherit', shell: true });
process.exit(result.status || 0);
