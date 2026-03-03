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
      className="sticky top-0 z-50 px-4 py-3"
      style={{ backgroundColor: bgColor, borderBottom: `1px solid ${borderColor}` }}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={AVATAR_URL}
            alt="jardinduvin"
            className="w-9 h-9 rounded-full"
            style={{ border: `2px solid ${theme === 'dark' ? '#333' : '#ccc'}` }}
          />
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}
            >
              jardinduvin
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-50">
              Fabrik
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 text-[11px] tracking-wide opacity-50">
          <span>{metrics.generated} generiert</span>
          <span>{metrics.copied} kopiert</span>
          <span>{metrics.saved} gemerkt</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-[10px] opacity-30 mr-1">
              {new Date(lastUpdate).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
              {timeLeft != null && ` | ${formatTimeRemaining(timeLeft)}`}
            </span>
          )}

          {loading && loadingStatus && (
            <span className="text-[10px] opacity-50 mr-1">{loadingStatus}</span>
          )}

          <button
            onClick={onGenerate}
            disabled={loading}
            className="px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#E63946' }}
          >
            {loading ? 'Generiert...' : 'Generieren'}
          </button>

          <button
            onClick={onShowFavorites}
            className="px-3 py-1.5 text-[11px] tracking-wide rounded-sm cursor-pointer"
            style={{ border: `1px solid ${borderColor}` }}
          >
            Gemerkt ({favCount})
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-3 py-1.5 text-[11px] tracking-wide rounded-sm cursor-pointer"
            style={{ border: `1px solid ${borderColor}` }}
          >
            {theme === 'dark' ? 'Hell' : 'Dunkel'}
          </button>

          <button
            onClick={onClearKey}
            className="px-2 py-1.5 text-[10px] tracking-wide rounded-sm cursor-pointer opacity-25 hover:opacity-60"
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
