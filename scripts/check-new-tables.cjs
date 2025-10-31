// scripts/check-new-tables.cjs
// Check existence and approximate row counts for the new schema tables.

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

    const tables = ['users','student_profiles','company_profiles','jobs','applications','saved_jobs','events'];

    for(const t of tables){
      try{
        const existsRes = await client.query(
          `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1) AS exists;`,
          [t]
        );
        const exists = existsRes.rows[0].exists;
        if(!exists){
          console.log(`${t}: does NOT exist`);
          continue;
        }
        // quick count
        let count = null;
        try{
          const cnt = await client.query(`SELECT COUNT(*)::int AS c FROM public."${t}"`);
          count = cnt.rows[0].c;
        }catch(e){
          count = 'unknown';
        }
        console.log(`${t}: exists (rows: ${count})`);
      }catch(err){
        console.log(`${t}: error checking - ${err.message || err}`);
      }
    }

    await client.end();
    process.exit(0);
  }catch(err){ console.error('err', err && err.message?err.message:err); process.exit(3); }
})();
