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
    // role can be 'student' or 'company' (default student)
    const roleRaw = (form.get('role') || form.get('accountType') || 'student').toString().toLowerCase();
    const role = roleRaw === 'company' ? 'company' : 'student';

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required' }), { status: 400 });
    }

    // check if user with email already exists
    const existQ = 'SELECT id FROM public.users WHERE lower(email) = lower($1) LIMIT 1';
    const existsRes = await client.query(existQ, [email]);
    if (existsRes.rows && existsRes.rows.length > 0) {
      return new Response(JSON.stringify({ message: 'Account with that email already exists' }), { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    // create user
    const insUser = await client.query(
      'INSERT INTO public.users (email, password_hash, role, created_at) VALUES ($1, $2, $3, now()) RETURNING id, email, role, created_at',
      [email, hashed, role]
    );
    const user = insUser.rows[0];

    // create profile depending on role
    let profile = null;
    if (role === 'student') {
      const firstName = (form.get('firstName') || form.get('first_name') || '').toString();
      const lastName = (form.get('lastName') || form.get('last_name') || '').toString();
      const phone = (form.get('phone') || '').toString();
      const university = (form.get('university') || '').toString();
      const degree = (form.get('degree') || '').toString();
      const grad_year = parseInt((form.get('grad_year') || form.get('gradYear') || '').toString()) || null;
      const bio = (form.get('bio') || '').toString();
      const linkedin_url = (form.get('linkedin') || form.get('linkedin_url') || '').toString();
      const portfolio_url = (form.get('portfolio') || form.get('portfolio_url') || '').toString();

      const insProfile = await client.query(
        `INSERT INTO public.student_profiles (user_id, first_name, last_name, phone, university, degree, grad_year, bio, linkedin_url, portfolio_url, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now()) RETURNING *`,
        [user.id, firstName || null, lastName || null, phone || null, university || null, degree || null, grad_year, bio || null, linkedin_url || null, portfolio_url || null]
      );
      profile = insProfile.rows[0];
    } else {
      // company
      const name = (form.get('name') || form.get('companyName') || '').toString();
      const description = (form.get('description') || '').toString();
      const website_url = (form.get('website') || form.get('website_url') || '').toString();
      const location = (form.get('location') || '').toString();

      const insProfile = await client.query(
        `INSERT INTO public.company_profiles (user_id, name, description, website_url, location, created_at)
         VALUES ($1,$2,$3,$4,$5, now()) RETURNING *`,
        [user.id, name || null, description || null, website_url || null, location || null]
      );
      profile = insProfile.rows[0];
    }

    // Do not return password_hash
    const out = { user: { id: user.id, email: user.email, role: user.role, created_at: user.created_at }, profile };
    return new Response(JSON.stringify(out), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('signup error', err);
    return new Response(JSON.stringify({ message: err.message || String(err) }), { status: 500 });
  } finally {
    try { await client.end(); } catch (e) {}
  }
}
