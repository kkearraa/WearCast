import * as SQLite from 'expo-sqlite';
import { GUEST_ID } from './session';

const DATABASE_NAME = 'wearcast.db';
const DATABASE_VERSION = 1;

let dbPromise = null;

// Make the web fail clearly instead of spinning forever
// , which gives up after 10 seconds:
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms)),
  ]);

export function getDb() {
  if (!dbPromise) {
    dbPromise = withTimeout(initDb(), 10000).catch((e) => {
      dbPromise = null; // allow a retry
      throw e;
    });
  }
  return dbPromise;
}

async function initDb() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db);

  // Until real accounts exist, everything belongs to a built-in guest user.
  await db.runAsync(
    'INSERT OR IGNORE INTO users (id, name, created_at) VALUES (?, ?, ?)',
    GUEST_ID,
    'Guest',
    Date.now()
  );

  return db;
}

// Versioned migrations: PRAGMA user_version remembers which schema the file has,
// so future changes (new columns/tables) can be added as version 2, 3, ...
async function migrate(db) {
  const row = await db.getFirstAsync('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version >= DATABASE_VERSION) return;

  if (version === 0) {
    await db.execAsync(`
      CREATE TABLE users (
        id            TEXT PRIMARY KEY NOT NULL,
        name          TEXT NOT NULL,
        email         TEXT UNIQUE,
        password_hash TEXT,
        salt          TEXT,
        created_at    INTEGER NOT NULL
      );

      CREATE TABLE clothes (
        id          TEXT PRIMARY KEY NOT NULL,
        user_id     TEXT NOT NULL,
        name        TEXT NOT NULL,
        category    TEXT NOT NULL,
        formality   TEXT,
        seasons     TEXT NOT NULL DEFAULT '[]',
        status      TEXT NOT NULL DEFAULT 'Clean' CHECK (status IN ('Clean', 'In Laundry')),
        image_path  TEXT,
        created_at  INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_clothes_user ON clothes(user_id, status);
    `);
    version = 1;
  }

  // if (version === 1) { ...future changes... version = 2; }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
