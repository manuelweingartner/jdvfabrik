import { useState, useEffect } from 'react';

const AVATAR_URL = 'https://pbs.twimg.com/profile_images/1342389942698323970/4FBBDglu_400x400.jpg';

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
      className="sticky top-0 z-50 px-3 py-2"
      style={{ backgroundColor: bgColor, borderBottom: `1px solid ${borderColor}` }}
    >
      {/* Top row: Logo + main actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img
            src={AVATAR_URL}
            alt="jardinduvin"
            className="w-8 h-8 rounded-full"
            style={{ border: `2px solid ${theme === 'dark' ? '#333' : '#ccc'}` }}
          />
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
            >
              jardinduvin
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-50 hidden min-[400px]:inline">
              Fabrik
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {loading && loadingStatus && (
            <span className="text-[10px] opacity-50 hidden sm:inline">{loadingStatus}</span>
          )}

          <button
            onClick={onGenerate}
            disabled={loading}
            className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#E63946' }}
          >
            {loading ? '...' : 'Go'}
          </button>

          <button
            onClick={onShowFavorites}
            className="px-2 py-1.5 text-[11px] tracking-wide rounded-sm cursor-pointer"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <span className="hidden sm:inline">Gemerkt </span>({favCount})
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-2 py-1.5 text-[11px] tracking-wide rounded-sm cursor-pointer"
            style={{ border: `1px solid ${borderColor}` }}
          >
            {theme === 'dark' ? 'Hell' : 'Dunkel'}
          </button>

          <button
            onClick={onClearKey}
            className="px-1.5 py-1.5 text-[10px] tracking-wide rounded-sm cursor-pointer opacity-25 hover:opacity-60"
            style={{ border: `1px solid ${borderColor}` }}
            title="API-Key wechseln"
          >
            Key
          </button>
        </div>
      </div>

      {/* Bottom row: metrics + timer (desktop only) */}
      <div className="hidden sm:flex items-center gap-4 mt-1 text-[10px] tracking-wide opacity-40">
        <span>{metrics.generated} generiert</span>
        <span>{metrics.copied} kopiert</span>
        <span>{metrics.saved} gemerkt</span>
        {lastUpdate && (
          <span>
            {new Date(lastUpdate).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
            {timeLeft != null && ` | Nächste: ${formatTimeRemaining(timeLeft)}`}
          </span>
        )}
      </div>
    </header>
  );
}
