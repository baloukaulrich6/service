/**
 * PostgreSQL connection pool.
 * Reads DATABASE_URL from .env.local (e.g. postgresql://user:pass@localhost:5432/afrimarket)
 */
import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually (before dotenv since we use ESM)
function loadEnv(file) {
  try {
    const content = readFileSync(resolve(process.cwd(), file), 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      if (key && !process.env[key]) {
        process.env[key] = rest.join('=').replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // File not found – rely on actual environment variables
  }
}

loadEnv('.env.local');
loadEnv('.env');

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set. Create a .env.local file with DATABASE_URL=postgresql://user:pass@localhost:5432/afrimarket');
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

// Test connection on startup
pool.query('SELECT 1').then(() => {
  console.log('PostgreSQL connected:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@'));
}).catch((err) => {
  console.error('PostgreSQL connection failed:', err.message);
  process.exit(1);
});
