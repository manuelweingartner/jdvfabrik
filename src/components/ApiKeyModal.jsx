import { useState } from 'react';

export default function ApiKeyModal({ onSave, theme }) {
  const [key, setKey] = useState('');

  const cardBg = theme === 'dark' ? '#161616' : '#FFFFFF';
  const borderColor = theme === 'dark' ? '#2A2A2A' : '#D4D0CB';
  const mutedText = theme === 'dark' ? '#666' : '#999';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md p-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
        <h2 className="text-lg mb-1" style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>
          jardinduvin <span className="text-[10px] font-mono uppercase tracking-[0.2em] not-italic opacity-60">Fabrik</span>
        </h2>
        <p className="text-xs mb-6" style={{ color: mutedText }}>
          Gratis Groq API-Key nötig. Wird nur lokal in deinem Browser gespeichert.
        </p>

        <div className="mb-4">
          <label className="block text-[10px] uppercase tracking-wider mb-2 opacity-60">
            Groq API-Key
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full px-3 py-2 text-sm bg-transparent outline-none"
            style={{ border: `1px solid ${borderColor}`, fontFamily: "'JetBrains Mono', monospace" }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && key.trim()) onSave(key.trim());
            }}
          />
        </div>

        <button
          onClick={() => key.trim() && onSave(key.trim())}
          disabled={!key.trim()}
          className="w-full py-2 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#E63946' }}
        >
          Speichern & Starten
        </button>

        <p className="text-[10px] mt-4 leading-relaxed" style={{ color: mutedText }}>
          Key holen: <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer"
            className="underline" style={{ color: '#457B9D' }}>console.groq.com/keys</a> — komplett gratis, extrem schnell.
        </p>
      </div>
    </div>
  );
}
