# jardinduvin Fabrik

Satirischer Bluesky-Post-Generator für @jardinduvin (Manuel Weingartner).

## Stack
- **Frontend**: React 19 (Vite) + Tailwind CSS v4
- **Backend**: Node.js Express API-Proxy (`server.js`)
- **API**: Google Gemini 2.0 Flash (gratis) mit Google Search Grounding
- **Fonts**: JetBrains Mono (UI/Posts) + Instrument Serif italic (Logo)

## Project Structure
```
jdvfabrik/
├── server.js                    # Express API-Proxy (Port 3001)
├── .env                         # GEMINI_API_KEY (nie committen!)
├── package.json
├── vite.config.js               # Vite + Tailwind + Proxy auf :3001
├── index.html
├── src/
│   ├── main.jsx
│   ├── index.css                # Tailwind + Theme-Variablen
│   ├── App.jsx                  # Haupt-App, State-Management
│   ├── config/
│   │   └── systemPrompt.js      # System-Prompt + Kategorie-Config
│   └── components/
│       ├── Header.jsx           # Logo, Metriken, Generieren, Theme-Toggle
│       ├── PostCard.jsx         # Post mit Kopieren/Bearbeiten/Merken
│       ├── FavoritesPanel.jsx   # Drawer mit gemerkten Posts
│       └── MobileNav.jsx        # Tab-Navigation Mobile
└── dist/                        # Build-Output
```

## Commands
- `npm run dev` — Vite Dev-Server (Frontend, Port 5173)
- `npm run server` — Express API-Server (Port 3001)
- `npm run build` — Production Build
- Beide Server gleichzeitig starten für Entwicklung

## Key Decisions
- API-Key NIE im Frontend — immer über Express-Proxy
- Posts max 300 Zeichen (Bluesky-Limit)
- Gendern mit Doppelpunkt, "ss" statt "ß", keine Emojis
- Dark Mode default, Theme in localStorage
- Favoriten in localStorage
- Auto-Refresh alle 2 Stunden
- 6 Kategorien: swiss, intl, solidarity, pop, daily, meme

## Kategorie-Farben
- swiss: #E63946 (Rot)
- intl: #457B9D (Blau)
- solidarity: #D63384 (Pink)
- pop: #E76F51 (Orange)
- daily: #588157 (Grün)
- meme: #7B2D8E (Lila)

## API
- Google Gemini 2.0 Flash (Free Tier: 15 RPM, 1M TPM)
- Google Search Grounding für tagesaktuelle News
- API-Key gratis unter https://aistudio.google.com
- Response: candidates[0].content.parts → text extrahieren → JSON-Array parsen
