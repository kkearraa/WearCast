// Pure helpers (no network, no database): build the text we send to the AI,
// and check the answer that comes back. Keeping them separate makes them easy to test.

const ORDER = ['Outerwear', 'Tops', 'Bottoms', 'Shoes'];

// What the AI is told. Items get SHORT ids ("1", "2", ...) so it can't mistype our long real ids.
export function buildPrompt({ weather, occasion, items, previousItemIds = [] }) {
  const c = weather.current;
  const month = new Date().toLocaleString('en', { month: 'long' });

  const list = items.map((item, i) => ({
    id: String(i + 1),
    name: item.name,
    category: item.category,
    formality: item.formality || 'Casual',
    seasons: item.seasons && item.seasons.length ? item.seasons : ['any'],
  }));

  const avoid = items
    .map((item, i) => (previousItemIds.includes(item.id) ? String(i + 1) : null))
    .filter(Boolean);

  const lines = [
    'You are a friendly personal stylist inside a wardrobe app.',
    'Choose ONE outfit ONLY from the clothes listed below (they are all clean and available).',
    '',
    `Weather now: ${Math.round(c.temp)}°C (feels like ${Math.round(c.feelsLike)}°C), ${c.description}.`,
    `Today's range: ${Math.round(c.low)}°C to ${Math.round(c.high)}°C. Rain chance: ${c.precipChance}%. Wind: ${Math.round(c.windKmh)} km/h. Humidity: ${c.humidity}%.`,
    `Month: ${month}. Occasion: ${occasion}.`,
    '',
    'Rules:',
    '- Use only ids from the list. Never invent clothes.',
    '- At most one piece per category (Tops, Bottoms, Shoes, Outerwear).',
    '- Build a complete outfit when possible: a top, a bottom and shoes. If a category has no items, skip it and mention that in the note.',
    '- Add Outerwear when it is cold (about 12°C or below), windy, or rain is likely (about 40% or more). Do not add a heavy coat when it is warm.',
    '- Match the occasion: Casual = relaxed everyday, Formal = smart/dressy, Gym = sportswear. If nothing fits the occasion perfectly, pick the closest and say so.',
    '- Prefer pieces whose seasons fit the month. "any" fits every season.',
    '- Think about waterproof or sturdy shoes when it is raining.',
  ];
  if (avoid.length) {
    lines.push(`- The user already saw an outfit using ids ${avoid.join(', ')}. Suggest a clearly DIFFERENT combination if the closet allows it.`);
  }
  lines.push(
    '',
    'Clothes (JSON):',
    JSON.stringify(list),
    '',
    'Reply with ONLY a JSON object, no markdown, in exactly this shape:',
    '{"pieces":[{"id":"<id from the list>","reason":"<max 12 words>"}],"tip":"<1-2 friendly sentences about why this outfit suits the weather>"}'
  );
  return lines.join('\n');
}

// Pulls the JSON out of the AI's text (it sometimes wraps it in ``` fences or adds words).
function extractJson(text) {
  if (typeof text !== 'string') return null;
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

// Checks the answer against the real closet. Returns { pieces:[{item, reason}], tip } or null.
export function parseOutfit(text, items) {
  const data = extractJson(text);
  if (!data || !Array.isArray(data.pieces)) return null;

  const seenIds = new Set();
  const seenCategories = new Set();
  const pieces = [];

  for (const p of data.pieces) {
    const item = items[Number(String(p?.id).trim()) - 1];
    if (!item || seenIds.has(item.id) || seenCategories.has(item.category)) continue;
    seenIds.add(item.id);
    seenCategories.add(item.category);
    pieces.push({
      item,
      reason: typeof p.reason === 'string' ? p.reason.trim().slice(0, 140) : '',
    });
  }
  if (pieces.length === 0) return null;

  // Show in a natural order: outerwear, top, bottom, shoes
  pieces.sort((a, b) => ORDER.indexOf(a.item.category) - ORDER.indexOf(b.item.category));

  const tip = typeof data.tip === 'string' ? data.tip.trim().slice(0, 500) : '';
  return { pieces, tip };
}
