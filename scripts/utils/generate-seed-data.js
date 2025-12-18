#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', '..', 'database', 'seeds', 'generated-seed.json');
const data = { generatedAt: new Date().toISOString(), currencies: ['ACT','NGN','GHS','KES','ZAR','USD','EUR'] };
fs.writeFileSync(out, JSON.stringify(data, null, 2));
console.log('Seed data written to', out);
