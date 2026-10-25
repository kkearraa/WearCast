import * as Crypto from 'expo-crypto';

// How many times the password is re-hashed. More rounds = slower for attackers,
// but also slower for the user. Lower it if login feels sluggish on your phone.
const ROUNDS = 1000;

const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

const sha256 = (text) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);

// Random per-user salt, so two users with the same password get different hashes.
export async function generateSalt() {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return toHex(bytes);
}

// salted + repeated SHA-256. The password itself is never stored.
export async function hashPassword(password, salt) {
  let hash = await sha256(`${salt}:${password}`);
  for (let i = 0; i < ROUNDS; i++) {
    hash = await sha256(`${hash}:${salt}`);
  }
  return hash;
}

// Compares two strings in constant time (doesn't stop at the first difference).
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
