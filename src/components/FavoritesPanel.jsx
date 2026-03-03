import { CATEGORY_CONFIG } from '../config/systemPrompt';

export default function FavoritesPanel({ show, onClose, favorites, onRemove, onCopy, theme }) {
  if (!show) return null;

  const bgColor = theme === 'dark' ? '#0A0A0A' : '#F5F0EB';
  const cardBg = theme === 'dark' ? '#161616' : '#FFFFFF';
  const borderColor = theme === 'dark' ? '#2A2A2A' : '#D4D0CB';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 w-full max-w-md overflow-y-auto"
        style={{ backgroundColor: bgColor, borderLeft: `1px solid ${borderColor}` }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Gemerkte Posts ({favorites.length})
            </span>
            <button
              onClick={onClose}
              className="text-[10px] uppercase tracking-wider opacity-50 hover:opacity-100 cursor-pointer"
            >
              Schliessen
            </button>
          </div>

          {favorites.length === 0 && (
            <p className="text-sm opacity-40 py-8 text-center">
              Noch keine Posts gemerkt.
            </p>
          )}

          <div className="space-y-3">
            {favorites.map((fav) => {
              const catConfig = CATEGORY_CONFIG[fav.cat] || { color: '#666', label: '?' };
              return (
                <div
                  key={fav.id}
                  style={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                    borderTop: `2px solid ${catConfig.color}`
                  }}
                >
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: catConfig.color }}
                      />
                      <span className="text-[10px] uppercase tracking-wider opacity-50">
                        {catConfig.label}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{fav.text}</p>
                    {fav.template && (
                      <p className="text-[10px] mt-2 opacity-40">[BILD: {fav.template}]</p>
                    )}
                  </div>
                  <div
                    className="flex border-t"
                    style={{ borderColor }}
                  >
                    <button
                      onClick={() => {
                        onCopy(fav.text);
                      }}
                      className="flex-1 py-1.5 text-[10px] uppercase tracking-wider opacity-40 hover:opacity-100 cursor-pointer"
                    >
                      Kopieren
                    </button>
                    <span style={{ color: borderColor }}>|</span>
                    <button
                      onClick={() => onRemove(fav.id)}
                      className="flex-1 py-1.5 text-[10px] uppercase tracking-wider opacity-40 hover:opacity-100 cursor-pointer"
                      style={{ color: '#E63946' }}
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
