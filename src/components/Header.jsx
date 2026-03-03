import { useState, useEffect } from 'react';

function formatTimeRemaining(ms) {
  if (ms <= 0) return '00:00';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function Header({
  theme,
  setTheme,
  metrics,
  onGenerate,
  loading,
  loadingStatus,
  lastUpdate,
  nextRefresh,
  onShowFavorites,
  favCount,
  onClearKey
}) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!nextRefresh) return;
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, nextRefresh - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRefresh]);

  const borderColor = theme === 'dark' ? '#2A2A2A' : '#D4D0CB';
  const bgColor = theme === 'dark' ? '#0A0A0A' : '#F5F0EB';

  return (
    <header
      className="sticky top-0 z-50 px-4 py-3"
      style={{ backgroundColor: bgColor, borderBottom: `1px solid ${borderColor}` }}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span
            className="text-2xl"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}
          >
            jardinduvin
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60 mt-1">
            Fabrik
          </span>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider opacity-60">
          <span>Generiert: {metrics.generated}</span>
          <span>Kopiert: {metrics.copied}</span>
          <span>Gemerkt: {metrics.saved}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-[10px] opacity-40">
              {new Date(lastUpdate).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
              {timeLeft != null && ` | ${formatTimeRemaining(timeLeft)}`}
            </span>
          )}

          {loading && loadingStatus && (
            <span className="text-[10px] opacity-50">{loadingStatus}</span>
          )}

          <button
            onClick={onGenerate}
            disabled={loading}
            className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#E63946' }}
          >
            {loading ? 'Generiert...' : 'Generieren'}
          </button>

          <button
            onClick={onShowFavorites}
            className="px-3 py-1.5 text-[11px] uppercase tracking-wider cursor-pointer"
            style={{ border: `1px solid ${borderColor}` }}
          >
            Gemerkt ({favCount})
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-3 py-1.5 text-[11px] uppercase tracking-wider cursor-pointer"
            style={{ border: `1px solid ${borderColor}` }}
          >
            {theme === 'dark' ? 'Hell' : 'Dunkel'}
          </button>

          <button
            onClick={onClearKey}
            className="px-3 py-1.5 text-[10px] uppercase tracking-wider cursor-pointer opacity-30 hover:opacity-70"
            style={{ border: `1px solid ${borderColor}` }}
            title="API-Key wechseln"
          >
            Key
          </button>
        </div>
      </div>
    </header>
  );
}
