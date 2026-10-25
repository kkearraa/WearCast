import AsyncStorage from '@react-native-async-storage/async-storage';

const OLD_KEY = '@wearcast_clothes';

// Copies clothes saved by the previous AsyncStorage version into SQLite (once),
// then deletes the old key so nothing is imported twice.
export async function migrateLegacyClothes(db, userId) {
  try {
    const json = await AsyncStorage.getItem(OLD_KEY);
    if (!json) return;

    const old = JSON.parse(json);
    if (Array.isArray(old)) {
      await db.withTransactionAsync(async () => {
        for (const item of old) {
          if (!item || !item.name) continue;
          await db.runAsync(
            `INSERT OR IGNORE INTO clothes
               (id, user_id, name, category, formality, seasons, status, image_path, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            String(item.id ?? `${Date.now()}${Math.random().toString(36).slice(2, 8)}`),
            userId,
            item.name,
            item.category || 'General',
            item.formality ?? null,
            JSON.stringify(Array.isArray(item.seasons) ? item.seasons : []),
            item.status === 'In Laundry' ? 'In Laundry' : 'Clean',
            item.image ?? null,
            Date.now()
          );
        }
      });
    }
    await AsyncStorage.removeItem(OLD_KEY);
  } catch (e) {
    console.warn('Legacy closet migration skipped:', e);
  }
}
