import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./data/buildframeos.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

// Auto-create tables on first use
let ready = false;
export async function ensureDb() {
  if (ready) return;
  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        client TEXT,
        status TEXT NOT NULL DEFAULT 'aktiv',
        start_date TEXT,
        end_date TEXT,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT ''
      )`,
      `CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company TEXT,
        role TEXT,
        phone TEXT,
        email TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT ''
      )`,
      `CREATE TABLE IF NOT EXISTS diary_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        weather TEXT,
        temperature REAL,
        workers INTEGER,
        activities TEXT,
        notes TEXT,
        created_at TEXT NOT NULL DEFAULT ''
      )`,
    ],
    "write"
  );
  ready = true;
}
