// scripts/inspect-columns.cjs
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

(async ()=>{
  try{
    const repoRoot = path.resolve(__dirname, '..');
    const env = loadEnv(path.join(repoRoot, '.env'));
    const url = env.DATABASE_URL || process.env.DATABASE_URL;
    if(!url){ console.error('No DATABASE_URL'); process.exit(2); }

    const client = new Client({ connectionString: url });
    await client.connect();
    const tables = ['students','companies'];
    for(const t of tables){
      const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position", [t]);
      if(!res.rows || res.rows.length===0){ console.log(`${t}: (no table)`); continue; }
      console.log(`${t}:`);
      for(const r of res.rows){ console.log(`  - ${r.column_name} (${r.data_type})`); }
    }
    await client.end();
  }catch(err){ console.error('err', err && err.message?err.message:err); process.exit(3); }
})();
