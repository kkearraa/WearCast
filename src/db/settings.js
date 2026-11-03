import { getDb } from './database';

// Non-secret app settings, stored in the SQLite `settings` table.
// (API keys are NOT stored here: they go in secure storage, see utils/secrets.js.)
const DEFAULTS = {
  units: 'metric', // 'metric' = °C, km/h   |   'imperial' = °F, mph
  useGps: '1',
  cacheWeather: '1',
  aiProvider: 'Gemini',
};

export async function getSettings() {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT key, value FROM settings');
  const map = { ...DEFAULTS };
  rows.forEach((r) => {
    map[r.key] = r.value;
  });
  return {
    units: map.units === 'imperial' ? 'imperial' : 'metric',
    useGps: map.useGps === '1',
    cacheWeather: map.cacheWeather === '1',
    aiProvider: map.aiProvider === 'OpenAI' ? 'OpenAI' : 'Gemini',
  };
}

export async function setSetting(key, value) {
  const db = await getDb();
  const stored = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    stored
  );
}
