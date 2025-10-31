// scripts/check-tables.cjs
// Checks whether specific tables exist in the PostgreSQL database and returns a quick row count.

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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
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
    console.log('Connecting to', url.replace(/:.+@/, ':******@'));
    await client.connect();

    const tablesToCheck = ['students','users','companies'];
    const results = {};

    for(const t of tablesToCheck){
      try{
        const existsRes = await client.query(
          `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1) AS exists;`,
          [t]
        );
        const exists = existsRes.rows[0].exists;
        if(!exists){
          results[t] = { exists: false };
          console.log(`- ${t}: does NOT exist`);
          continue;
        }
        // If exists, try a quick count (may be slow on huge tables)
        let count = null;
        try{
          const cntRes = await client.query(`SELECT COUNT(*)::int AS c FROM public."${t}"`);
          count = cntRes.rows[0].c;
        }catch(errCount){
          // If direct count fails (e.g., permission or quoting), attempt estimated count
          try{
            const estRes = await client.query(
              `SELECT reltuples::bigint AS estimate FROM pg_class WHERE relname = $1;`,
              [t]
            );
            count = estRes.rows[0] && estRes.rows[0].estimate ? `~${estRes.rows[0].estimate}` : null;
          }catch(e){
            count = null;
          }
        }
        results[t] = { exists: true, rows: count };
        console.log(`- ${t}: exists (rows: ${count !== null ? count : 'unknown'})`);
      }catch(err){
        console.error(`Error checking table ${t}:`, err.message || err);
        results[t] = { error: err.message || String(err) };
      }
    }

    await client.end();
    process.exit(0);
  }catch(err){
    console.error('Unexpected error:', err && err.message ? err.message : err);
    process.exit(3);
  }
})();
