#!/usr/bin/env node
(async () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: validate-transactions <transactionId>');
    process.exit(1);
  }
  const res = await fetch(`${base}/transactions/${id}`).catch(() => null);
  if (!res || !res.ok) {
    console.error('Transaction not valid or not found');
    process.exit(2);
  }
  const json = await res.json();
  console.log('Transaction OK:', json);
})();
