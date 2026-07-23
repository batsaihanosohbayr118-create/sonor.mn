import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

/**
 * Generic document store backed by Neon PostgreSQL.
 *
 * Every store (articles, ads, ambassadors, facts, mps, videos) keeps a JSON
 * array of records. We persist each array as rows in a single `store_documents`
 * table (one row per record, JSONB payload). When DATABASE_URL is not set we
 * fall back to the local `data/*.json` files so development works without a DB.
 */

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

export const dbEnabled = () => Boolean(DATABASE_URL);

const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

let schemaReady: Promise<void> | null = null;
function ensureSchema(): Promise<void> {
  if (!sql) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS store_documents (
        collection text NOT NULL,
        id text NOT NULL,
        data jsonb NOT NULL,
        sort_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (collection, id)
      )`;
      // Self-heal an older table that predates the sort_order column.
      await sql`ALTER TABLE store_documents ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0`;
    })().catch(error => {
      schemaReady = null; // allow a retry on the next call
      throw error;
    });
  }
  return schemaReady;
}

/* ── local JSON fallback (dev without DATABASE_URL) ── */
const fileFor = (collection: string) => path.join(process.cwd(), 'data', `${collection}.json`);

function readLocal<T>(collection: string): T[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(fileFor(collection), 'utf-8'));
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocal<T>(collection: string, items: T[]): void {
  const file = fileFor(collection);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(items, null, 2), 'utf-8');
}

/** Replace the whole collection with `items` (array order is preserved). */
export async function writeCollection<T>(collection: string, items: T[]): Promise<void> {
  if (!sql) {
    writeLocal(collection, items);
    return;
  }
  await ensureSchema();
  const json = JSON.stringify(items ?? []);
  await sql.transaction([
    sql`DELETE FROM store_documents WHERE collection = ${collection}`,
    sql`INSERT INTO store_documents (collection, id, data, sort_order)
        SELECT ${collection}, ord::text, elem, ord::int
        FROM jsonb_array_elements(${json}::jsonb) WITH ORDINALITY AS t(elem, ord)`,
  ]);
}

/**
 * Read a collection. If the DB collection is empty but a committed
 * `data/<collection>.json` seed exists, it is imported once and returned —
 * this migrates the existing local content into Neon on first access.
 */
export async function readCollection<T>(collection: string): Promise<T[]> {
  if (!sql) return readLocal<T>(collection);
  await ensureSchema();

  const rows = await sql`SELECT data FROM store_documents WHERE collection = ${collection} ORDER BY sort_order ASC`;
  if (rows.length === 0) {
    const seed = readLocal<T>(collection);
    if (seed.length > 0) {
      await writeCollection(collection, seed);
      return seed;
    }
    return [];
  }
  return rows.map(row => row.data as T);
}
