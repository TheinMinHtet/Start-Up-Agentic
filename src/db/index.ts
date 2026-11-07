import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Allow builds to succeed without throwing immediately at build-time if env is missing
  console.warn('[Database] DATABASE_URL is not set. Database queries will fail.');
}

const sql = neon(connectionString || 'postgresql://placeholder:placeholder@localhost/placeholder');
export const db = drizzle(sql, { schema });
