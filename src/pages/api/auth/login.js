import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return null;
    const raw = fs.readFileSync(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key === 'DATABASE_URL') return val;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function getColumns(client, table) {
  const q = `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`;
  const res = await client.query(q, [table]);
  return res.rows.map(r => r.column_name);
}

export async function POST({ request }) {
  const dbUrl = loadDatabaseUrl();
  if (!dbUrl) return new Response(JSON.stringify({ message: 'DATABASE_URL not configured' }), { status: 500 });

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();

    const form = await request.formData();
    const email = (form.get('email') || '').toString().trim().toLowerCase();
    const password = (form.get('password') || '').toString();
    if (!email || !password) return new Response(JSON.stringify({ message: 'email and password required' }), { status: 400 });
    // find user in normalized users table
    const q = 'SELECT id, email, role, password_hash FROM public.users WHERE lower(email) = lower($1) LIMIT 1';
    const res = await client.query(q, [email]);
    if (!res.rows || res.rows.length === 0) return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });

    const user = res.rows[0];
    const hash = user.password_hash;
    if (!hash) return new Response(JSON.stringify({ message: 'User has no password set' }), { status: 500 });

    const ok = await bcrypt.compare(password, hash);
    if (!ok) return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });

    // fetch profile depending on role
    let profile = null;
    if (user.role === 'student') {
      const p = await client.query('SELECT * FROM public.student_profiles WHERE user_id = $1 LIMIT 1', [user.id]);
      if (p.rows && p.rows.length > 0) profile = p.rows[0];
    } else if (user.role === 'company') {
      const p = await client.query('SELECT * FROM public.company_profiles WHERE user_id = $1 LIMIT 1', [user.id]);
      if (p.rows && p.rows.length > 0) profile = p.rows[0];
    }

    const outUser = { id: user.id, email: user.email, role: user.role };
    return new Response(JSON.stringify({ user: outUser, profile }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('login error', err);
    return new Response(JSON.stringify({ message: err.message || String(err) }), { status: 500 });
  } finally {
    try{ await client.end(); }catch(e){}
  }
}
