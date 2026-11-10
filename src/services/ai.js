import { getClothes } from '../utils/storage';
import { getSettings } from '../db/settings';
import { getAiApiKey } from '../utils/secrets';
import { buildPrompt, parseOutfit } from './outfitPrompt';
import { AiError, callGemini, callOpenAI } from './aiClients';

// The whole "suggest an outfit" flow:
// closet (Clean items only) + live weather + occasion  ->  AI  ->  checked outfit.
export async function suggestOutfit({ weather, occasion, previousItemIds = [] }) {
  if (!weather) throw new AiError('NO_WEATHER');

  const settings = await getSettings();
  const provider = settings.aiProvider;

  const apiKey = await getAiApiKey(provider);
  if (!apiKey) throw new AiError('NO_KEY');

  const clothes = await getClothes();
  const items = clothes.filter((c) => c.status === 'Clean'); // laundry items are never suggested
  if (items.length === 0) throw new AiError('NO_CLOTHES');

  const prompt = buildPrompt({ weather, occasion, items, previousItemIds });
  const text = provider === 'OpenAI' ? await callOpenAI(prompt, apiKey) : await callGemini(prompt, apiKey);

  const outfit = parseOutfit(text, items);
  if (!outfit) throw new AiError('BAD_RESPONSE');

  return { ...outfit, occasion, provider, createdAt: Date.now() };
}
