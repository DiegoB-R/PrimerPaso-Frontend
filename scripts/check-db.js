// scripts/check-db.js
// Quick DB connectivity checker for local development.
// Reads DATABASE_URL from .env and attempts SELECT NOW() via pg.

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const out = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    let key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // remove optional surrounding quotes
    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

(async function main(){
  try{
    const repoRoot = path.resolve(__dirname, '..');
    const envPath = path.join(repoRoot, '.env');
    const env = loadEnv(envPath);
    const url = env.DATABASE_URL || process.env.DATABASE_URL;
    if(!url){
      console.error('ERROR: No DATABASE_URL found in .env or environment.');
      process.exit(2);
    }

    const client = new Client({ connectionString: url, statement_timeout: 5000 });
    console.log('Trying to connect to', url.replace(/:.+@/, ':******@'));
    await client.connect();
    const res = await client.query('SELECT NOW() AS now');
    console.log('CONNECTED:', res.rows[0].now);
    await client.end();
    process.exit(0);
  }catch(err){
    console.error('DB connection failed:');
    console.error(err && err.message ? err.message : err);
    process.exit(3);
  }
})();
