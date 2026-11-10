import { getDb } from './database';
import { GUEST_ID } from './session';
import { generateSalt, hashPassword, safeEqual } from '../utils/security';

const newId = () => `u${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

export const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const getInitials = (name) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

// database row -> user object used by the screens (never includes the hash or salt)
const rowToUser = (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  createdAt: r.created_at,
  initials: getInitials(r.name),
  firstName: (r.name || '').trim().split(/\s+/)[0] || r.name,
  isGuest: r.id === GUEST_ID,
});

const isUniqueError = (e) => /UNIQUE/i.test(String(e?.message));

export async function getUserById(id) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', id);
  return row ? rowToUser(row) : null;
}

export async function createUser({ name, email, password }) {
  const db = await getDb();
  const cleanEmail = normalizeEmail(email);

  const existing = await db.getFirstAsync('SELECT id FROM users WHERE email = ?', cleanEmail);
  if (existing) throw new Error('EMAIL_TAKEN');

  const id = newId();
  const salt = await generateSalt();
  const hash = await hashPassword(password, salt);
  const createdAt = Date.now();

  try {
    await db.runAsync(
      'INSERT INTO users (id, name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      id,
      name.trim(),
      cleanEmail,
      hash,
      salt,
      createdAt
    );
  } catch (e) {
    if (isUniqueError(e)) throw new Error('EMAIL_TAKEN');
    throw e;
  }

  return rowToUser({ id, name: name.trim(), email: cleanEmail, created_at: createdAt });
}

// Returns the user if email + password match, otherwise null.
export async function verifyLogin(email, password) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM users WHERE email = ?', normalizeEmail(email));
  if (!row || !row.password_hash || !row.salt) return null;

  const attempt = await hashPassword(password, row.salt);
  return safeEqual(attempt, row.password_hash) ? rowToUser(row) : null;
}

export async function updateUserProfile(id, { name, email }) {
  const db = await getDb();
  const cleanEmail = normalizeEmail(email);

  const taken = await db.getFirstAsync(
    'SELECT id FROM users WHERE email = ? AND id <> ?',
    cleanEmail,
    id
  );
  if (taken) throw new Error('EMAIL_TAKEN');

  try {
    await db.runAsync('UPDATE users SET name = ?, email = ? WHERE id = ?', name.trim(), cleanEmail, id);
  } catch (e) {
    if (isUniqueError(e)) throw new Error('EMAIL_TAKEN');
    throw e;
  }
  return getUserById(id);
}

export async function changeUserPassword(id, currentPassword, newPassword) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', id);
  if (!row || !row.password_hash) throw new Error('WRONG_PASSWORD');

  const attempt = await hashPassword(currentPassword, row.salt);
  if (!safeEqual(attempt, row.password_hash)) throw new Error('WRONG_PASSWORD');

  const salt = await generateSalt();
  const hash = await hashPassword(newPassword, salt);
  await db.runAsync('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?', hash, salt, id);
}
