import { getDb } from './database';
import { resolveImageUri } from '../utils/imageStore';

const newId = () => `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

// Saves one outfit and its pieces together (all or nothing).
export async function saveOutfit(userId, { occasion, tip, weather, pieces }) {
  const db = await getDb();
  const id = newId();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO outfits (id, user_id, occasion, tip, weather, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      id,
      userId,
      occasion,
      tip || '',
      weather || '',
      Date.now()
    );
    for (let i = 0; i < pieces.length; i++) {
      await db.runAsync(
        'INSERT INTO outfit_items (outfit_id, item_id, position, reason) VALUES (?, ?, ?, ?)',
        id,
        pieces[i].item.id,
        i,
        pieces[i].reason || ''
      );
    }
  });
  return id;
}

export async function deleteOutfit(userId, id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM outfits WHERE id = ? AND user_id = ?', id, userId);
}

export async function countOutfits(userId) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT COUNT(*) AS n FROM outfits WHERE user_id = ?', userId);
  return row?.n ?? 0;
}

// All saved outfits of this user, newest first, with their clothes.
// If every piece of an outfit was deleted from the closet, the empty outfit is removed.
export async function getOutfits(userId) {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM outfits WHERE user_id = ? AND id NOT IN (SELECT outfit_id FROM outfit_items)',
    userId
  );
  const outfits = await db.getAllAsync(
    'SELECT * FROM outfits WHERE user_id = ? ORDER BY created_at DESC',
    userId
  );
  const rows = await db.getAllAsync(
    `SELECT oi.outfit_id, oi.position, oi.reason, c.id, c.name, c.category, c.status, c.image_path
       FROM outfit_items oi
       JOIN clothes c ON c.id = oi.item_id
      WHERE oi.outfit_id IN (SELECT id FROM outfits WHERE user_id = ?)
      ORDER BY oi.position`,
    userId
  );
  const byOutfit = {};
  for (const r of rows) {
    (byOutfit[r.outfit_id] ||= []).push({
      reason: r.reason,
      item: {
        id: r.id,
        name: r.name,
        category: r.category,
        status: r.status,
        image: resolveImageUri(r.image_path),
      },
    });
  }
  return outfits.map((o) => ({
    id: o.id,
    occasion: o.occasion,
    tip: o.tip,
    weather: o.weather,
    createdAt: o.created_at,
    pieces: byOutfit[o.id] || [],
  }));
}
