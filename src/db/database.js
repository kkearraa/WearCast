import * as SQLite from 'expo-sqlite';
import { migrateLegacyClothes } from './legacyMigration';
import { GUEST_ID } from './session';

const DATABASE_NAME = 'wearcast.db';
const DATABASE_VERSION = 1;

let dbPromise = null;

// One shared connection for the whole app. The first call opens + prepares the
// database, every later call reuses the same promise.
export function getDb() {
  if (!dbPromise) {
    dbPromise = initDb().catch((e) => {
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

  // Until real accounts exist (step 2), everything belongs to a built-in guest user.
  await db.runAsync(
    'INSERT OR IGNORE INTO users (id, name, created_at) VALUES (?, ?, ?)',
    GUEST_ID,
    'Guest',
    Date.now()
  );

  // One-time import of clothes saved by the old AsyncStorage version of the app.
  await migrateLegacyClothes(db, GUEST_ID);
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
