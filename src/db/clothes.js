import { getDb } from './database';

const newId = () => `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

const parseSeasons = (value) => {
  try {
    const arr = JSON.parse(value);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

// database row  ->  the item shape the screens already use
const rowToItem = (r) => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  category: r.category,
  formality: r.formality,
  seasons: parseSeasons(r.seasons),
  status: r.status,
  image: r.image_path,
  addedOn: new Date(r.created_at).toLocaleDateString(),
});

// Columns that updateClothing() is allowed to change (item field -> column name)
const EDITABLE = {
  name: 'name',
  category: 'category',
  formality: 'formality',
  seasons: 'seasons',
  status: 'status',
  image: 'image_path',
};

export async function getClothesByUser(userId) {
  const db = await getDb();
  const rows = await db.getAllAsync(
    'SELECT * FROM clothes WHERE user_id = ? ORDER BY created_at DESC',
    userId
  );
  return rows.map(rowToItem);
}

export async function getClothingById(userId, id) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM clothes WHERE id = ? AND user_id = ?', id, userId);
  return row ? rowToItem(row) : null;
}

export async function addClothing(userId, item) {
  const db = await getDb();
  const id = newId();
  const createdAt = Date.now();
  await db.runAsync(
    `INSERT INTO clothes
       (id, user_id, name, category, formality, seasons, status, image_path, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    userId,
    item.name,
    item.category || 'General',
    item.formality ?? null,
    JSON.stringify(item.seasons ?? []),
    item.status === 'In Laundry' ? 'In Laundry' : 'Clean',
    item.image ?? null,
    createdAt
  );
  return rowToItem({
    id,
    user_id: userId,
    name: item.name,
    category: item.category || 'General',
    formality: item.formality ?? null,
    seasons: JSON.stringify(item.seasons ?? []),
    status: item.status === 'In Laundry' ? 'In Laundry' : 'Clean',
    image_path: item.image ?? null,
    created_at: createdAt,
  });
}

export async function updateClothing(id, fields) {
  const sets = [];
  const values = [];
  for (const [key, column] of Object.entries(EDITABLE)) {
    if (fields[key] !== undefined) {
      sets.push(`${column} = ?`);
      values.push(key === 'seasons' ? JSON.stringify(fields[key]) : fields[key]);
    }
  }
  if (sets.length === 0) return;

  const db = await getDb();
  await db.runAsync(`UPDATE clothes SET ${sets.join(', ')} WHERE id = ?`, ...values, id);
}

export async function deleteClothing(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM clothes WHERE id = ?', id);
}

export async function clearClothesForUser(userId) {
  const db = await getDb();
  await db.runAsync('DELETE FROM clothes WHERE user_id = ?', userId);
}

// Counts computed by the database itself (used by the Home screen)
export async function getClothingStats(userId) {
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(status = 'Clean'), 0)      AS clean,
            COALESCE(SUM(status = 'In Laundry'), 0) AS laundry
       FROM clothes WHERE user_id = ?`,
    userId
  );
  return { total: row.total, clean: row.clean, laundry: row.laundry };
}
