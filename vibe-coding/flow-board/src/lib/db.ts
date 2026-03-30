import Database from 'better-sqlite3';
import path from 'path';
import { SCHEMA } from './schema';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'database.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA);
  }
  return db;
}
