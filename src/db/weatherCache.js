import { getDb } from './database';

// Keeps the LAST successful weather result, so the app can still show something
// when there is no internet (this is the "graceful degradation" part).
export async function saveWeatherCache(data) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO weather_cache (id, data, fetched_at) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, fetched_at = excluded.fetched_at`,
    JSON.stringify(data),
    data.fetchedAt ?? Date.now()
  );
}

export async function loadWeatherCache() {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT data FROM weather_cache WHERE id = 1');
  if (!row) return null;
  try {
    return JSON.parse(row.data);
  } catch {
    return null;
  }
}

export async function clearWeatherCache() {
  const db = await getDb();
  await db.runAsync('DELETE FROM weather_cache');
}
