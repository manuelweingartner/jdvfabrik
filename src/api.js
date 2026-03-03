import { SYSTEM_PROMPT } from './config/systemPrompt';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export function getApiKey() {
  return localStorage.getItem('fabrik-gemini-key') || '';
}

export function setApiKey(key) {
  localStorage.setItem('fabrik-gemini-key', key);
}

export function clearApiKey() {
  localStorage.removeItem('fabrik-gemini-key');
}

async function fetchGemini(apiKey, userMessage, useSearch) {
  const body = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ],
    generationConfig: {
      temperature: 1.0,
      maxOutputTokens: 16000
    }
  };

  if (useSearch) {
    body.tools = [{ googleSearch: {} }];
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let detail = '';
    try {
      const err = JSON.parse(errorText);
      detail = err.error?.message || '';
    } catch {}
    throw { status: response.status, detail };
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts
    .filter((p) => p.text)
    .map((p) => p.text)
    .join('');
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryWithRetry(apiKey, userMessage, useSearch, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchGemini(apiKey, userMessage, useSearch);
    } catch (err) {
      if (err.status === 429 && i < retries) {
        console.warn(`Rate limit (Versuch ${i + 1}), warte ${(i + 1) * 10}s...`);
        await wait((i + 1) * 10000);
        continue;
      }
      throw err;
    }
  }
}

export async function callGemini(userMessage) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Kein API-Key gesetzt');
  }

  // Try with Google Search first
  try {
    return await tryWithRetry(apiKey, userMessage, true, 1);
  } catch (err) {
    if (err.status === 429) {
      console.warn('Rate limit mit Search, versuche ohne...');
      try {
        return await tryWithRetry(apiKey, userMessage, false, 2);
      } catch (err2) {
        if (err2.status === 429) {
          throw new Error('Rate Limit erreicht. Bitte 1-2 Minuten warten und nochmal versuchen.');
        }
        if (err2.status === 400 || err2.status === 403) {
          throw new Error('Ungültiger API-Key. Bitte prüfen.');
        }
        throw new Error(`Gemini Fehler: ${err2.status} ${err2.detail || ''}`);
      }
    }
    if (err.status === 400 || err.status === 403) {
      throw new Error('Ungültiger API-Key. Bitte prüfen.');
    }
    throw new Error(`Gemini Fehler: ${err.status} ${err.detail || ''}`);
  }
}
