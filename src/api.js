import { SYSTEM_PROMPT } from './config/systemPrompt';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_PRIMARY = 'llama-3.3-70b-versatile';
const MODEL_FALLBACK = 'llama-3.1-8b-instant';

export function getApiKey() {
  return localStorage.getItem('fabrik-groq-key') || '';
}

export function setApiKey(key) {
  localStorage.setItem('fabrik-groq-key', key);
}

export function clearApiKey() {
  localStorage.removeItem('fabrik-groq-key');
}

async function fetchGroq(apiKey, userMessage, model) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
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
      detail = err.error?.message || '';
    } catch {}
    throw { status: response.status, detail };
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function callGemini(userMessage, onStatus) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Kein API-Key gesetzt');
  }

  // Try primary model (70B)
  try {
    onStatus?.('Generiert mit Llama 3.3 70B...');
    return await fetchGroq(apiKey, userMessage, MODEL_PRIMARY);
  } catch (err) {
    if (err.status === 429) {
      // Fallback to faster/smaller model
      try {
        onStatus?.('Fallback: Llama 3.1 8B...');
        return await fetchGroq(apiKey, userMessage, MODEL_FALLBACK);
      } catch (err2) {
        if (err2.status === 429) {
          throw new Error('Rate Limit erreicht. Bitte kurz warten.');
        }
        if (err2.status === 401) {
          throw new Error('Ungültiger API-Key. Bitte prüfen.');
        }
        throw new Error(`Groq Fehler: ${err2.status} ${err2.detail || ''}`);
      }
    }
    if (err.status === 401) {
      throw new Error('Ungültiger API-Key. Bitte prüfen.');
    }
    throw new Error(`Groq Fehler: ${err.status} ${err.detail || ''}`);
  }
}
