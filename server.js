import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from dist in production
app.use(express.static(path.join(__dirname, 'dist')));

// Read system prompt from config file
const systemPromptModule = readFileSync(
  path.join(__dirname, 'src/config/systemPrompt.js'),
  'utf-8'
);
const systemPromptMatch = systemPromptModule.match(/export const SYSTEM_PROMPT = `([\s\S]*?)`;/);
const SYSTEM_PROMPT = systemPromptMatch
  ? systemPromptMatch[1]
  : 'Du bist ein satirischer Ghostwriter.';

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function callGemini(userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY nicht konfiguriert');
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      tools: [{ googleSearch: {} }],
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 16000
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error(`Gemini API Fehler: ${response.status}`);
  }

  const data = await response.json();

  // Extract text from Gemini response
  const parts = data.candidates?.[0]?.content?.parts || [];
  const textContent = parts
    .filter((p) => p.text)
    .map((p) => p.text)
    .join('');

  // Return in a normalized format the frontend can parse
  return {
    content: [{ type: 'text', text: textContent }]
  };
}

app.post('/api/generate', async (req, res) => {
  try {
    const { userMessage } = req.body;
    const data = await callGemini(userMessage);
    res.json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/generate-category', async (req, res) => {
  try {
    const { category, categoryLabel } = req.body;

    const now = new Date();
    const dateStr = now.toLocaleDateString('de-CH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const userMessage = `Es ist ${dateStr}. Generiere genau 10 Posts NUR für die Kategorie "${category}" (${categoryLabel}). Nutze Web-Suche für aktuelle Nachrichten von heute. Antworte NUR mit einem validen JSON-Array.`;

    const data = await callGemini(userMessage);
    res.json(data);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`jardinduvin Fabrik API running on :${PORT}`));
