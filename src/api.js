import { SYSTEM_PROMPT } from './config/systemPrompt';

const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';
const MODEL = 'mistral-small-latest';

export function getApiKey() {
  return localStorage.getItem('fabrik-api-key') || '';
}

export function setApiKey(key) {
  localStorage.setItem('fabrik-api-key', key);
}

export function clearApiKey() {
  localStorage.removeItem('fabrik-api-key');
}

export async function callGemini(userMessage, onStatus) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Kein API-Key gesetzt');
  }

  onStatus?.('Generiert...');

  const response = await fetch(MISTRAL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 1.0,
      max_tokens: 8000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let detail = '';
    try {
      const err = JSON.parse(errorText);
      detail = err.message || err.error?.message || '';
    } catch {}

    if (response.status === 429) {
      throw new Error('Rate Limit. Bitte 30 Sekunden warten.');
    }
    if (response.status === 401) {
      throw new Error('Ungültiger API-Key. Bitte prüfen.');
    }
    throw new Error(`API Fehler ${response.status}: ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
