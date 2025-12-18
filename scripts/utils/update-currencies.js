#!/usr/bin/env node
(async () => {
  const primary = process.env.PRIMARY_EXCHANGE_RATE_API || 'exchangerate';
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  console.log('Triggering rate update (ensure cron endpoint or admin action exists)...');
  const res = await fetch(`${base}/cron/update-rates`).catch(() => null);
  console.log('Update response:', res && res.status);
})();
