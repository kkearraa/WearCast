import * as SQLite from 'expo-sqlite';
import { GUEST_ID } from './session';

const DATABASE_NAME = 'wearcast.db';
const DATABASE_VERSION = 3;

let dbPromise = null;

// Gives up instead of waiting forever (for example if the database can't open).
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms)),
  ]);

// One shared connection for the whole app. The first call opens + prepares the
// database, every later call reuses the same promise.
export function getDb() {
  if (!dbPromise) {
    dbPromise = withTimeout(initDb(), 10000).catch((e) => {
      dbPromise = null; // allow a retry if opening failed
      throw e;
    });
  }
  return dbPromise;
}

async function initDb() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await migrate(db);

  // Built-in guest user, for "Continue as guest".
  await db.runAsync(
    'INSERT OR IGNORE INTO users (id, name, created_at) VALUES (?, ?, ?)',
    GUEST_ID,
    'Guest',
    Date.now()
  );
  return db;
}

// Versioned migrations: PRAGMA user_version remembers which schema the file has,
// so new tables can be added later without losing existing data.
async function migrate(db) {
  const row = await db.getFirstAsync('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version >= DATABASE_VERSION) return;

  // Version 1: accounts + closet
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

  // Version 2: app settings + the last weather (so it still shows offline)
  if (version === 1) {
    await db.execAsync(`
      CREATE TABLE settings (
        key   TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );

      CREATE TABLE weather_cache (
        id         INTEGER PRIMARY KEY CHECK (id = 1),
        data       TEXT NOT NULL,
        fetched_at INTEGER NOT NULL
      );
    `);
    version = 2;
  }

  // Version 3: saved outfits (an outfit + the clothes it is made of)
  if (version === 2) {
    await db.execAsync(`
      CREATE TABLE outfits (
        id         TEXT PRIMARY KEY NOT NULL,
        user_id    TEXT NOT NULL,
        occasion   TEXT NOT NULL,
        tip        TEXT,
        weather    TEXT,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE outfit_items (
        outfit_id TEXT NOT NULL,
        item_id   TEXT NOT NULL,
        position  INTEGER NOT NULL,
        reason    TEXT,
        PRIMARY KEY (outfit_id, item_id),
        FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES clothes(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_outfits_user ON outfits(user_id, created_at);
    `);
    version = 3;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
