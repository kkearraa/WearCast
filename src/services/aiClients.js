// Calls the AI providers directly from the phone (no backend).
export class AiError extends Error {
  constructor(code, detail = '') {
    super(code);
    this.code = code;
    this.detail = detail; // technical reason, shown by the "Test key" button
  }
}

// Google can rename models, so we try a short list in order (a "latest" alias first).
// 'gemini-2.5-flash' is confirmed available on this account's key list.
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];
const OPENAI_MODEL = 'gpt-4o-mini';

const post = (url, headers, body) => send(url, { method: 'POST', headers, body, timeoutMs: 30000 });
const get = (url, headers) => send(url, { method: 'GET', headers, timeoutMs: 15000 });

async function send(url, { method, headers, body, timeoutMs }) {
  const controller = new AbortController();
  let timedOut = false; // set by OUR timer, because the cancel error's name differs between phones
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    return await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    console.warn('AI request failed:', e?.name, e?.message);
    // Aborted by our own 30 s timer = TIMEOUT. Anything else = the phone couldn't reach the server.
    throw new AiError(timedOut ? 'TIMEOUT' : 'OFFLINE', `${e?.name || 'Error'}: ${e?.message || ''}`.trim());
  } finally {
    clearTimeout(timer);
  }
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorMessage(data) {
  return String(data?.error?.message || '');
}

export async function callGemini(prompt, apiKey) {
  // 2.5 Flash "thinks" before answering, which is slow and not needed to pick an outfit.
  // Turning thinking off makes the answer arrive in a couple of seconds.
  const makeBody = (model, fast) => ({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.8,
      maxOutputTokens: 8192,
      ...(fast && /^gemini-2\.5-flash/.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  });
  const isKeyProblem = (status, message) =>
    status === 401 || status === 403 || /api key not valid|api_key_invalid/i.test(message);

  let lastError = new AiError('SERVER');
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const headers = { 'x-goog-api-key': apiKey };

    let response = await post(url, headers, makeBody(model, true));
    let data = await readJson(response);

    // A 400 that is not about the key may be the "thinking" setting: retry once without it.
    if (response.status === 400 && !isKeyProblem(response.status, errorMessage(data))) {
      response = await post(url, headers, makeBody(model, false));
      data = await readJson(response);
    }

    if (response.ok) {
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const text = parts
        .filter((p) => !p.thought && typeof p.text === 'string')
        .map((p) => p.text)
        .join('');
      if (!text) throw new AiError('BAD_RESPONSE');
      return text;
    }

    const message = errorMessage(data);
    if (isKeyProblem(response.status, message)) throw new AiError('BAD_KEY');
    if (response.status === 429) throw new AiError('RATE_LIMIT');
    if (response.status === 404 || response.status >= 500) {
      lastError = new AiError('SERVER', `HTTP ${response.status} on ${model}`); // try the next model
      continue;
    }
    throw new AiError('SERVER', `HTTP ${response.status}: ${message.slice(0, 120)}`);
  }
  throw lastError;
}

export async function callOpenAI(prompt, apiKey) {
  const response = await post(
    'https://api.openai.com/v1/chat/completions',
    { Authorization: `Bearer ${apiKey}` },
    {
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    }
  );
  const data = await readJson(response);

  if (response.ok) {
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new AiError('BAD_RESPONSE');
    return text;
  }
  if (response.status === 401) throw new AiError('BAD_KEY');
  if (response.status === 429) throw new AiError('RATE_LIMIT');
  throw new AiError('SERVER');
}

// Quick check used by the "Test key" button in Settings: asks the provider for its model list.
// Resolves when the key is accepted, throws AiError('BAD_KEY' | 'OFFLINE' | 'TIMEOUT' | ...) otherwise.
export async function checkAiKey(provider, apiKey) {
  const isOpenAI = provider === 'OpenAI';
  const response = await get(
    isOpenAI ? 'https://api.openai.com/v1/models' : 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1',
    isOpenAI ? { Authorization: `Bearer ${apiKey}` } : { 'x-goog-api-key': apiKey }
  );
  if (response.ok) return true;
  const data = await readJson(response);
  if (response.status === 401 || response.status === 403 || /api key not valid|api_key_invalid/i.test(errorMessage(data))) {
    throw new AiError('BAD_KEY');
  }
  if (response.status === 429) throw new AiError('RATE_LIMIT');
  throw new AiError('SERVER');
}
