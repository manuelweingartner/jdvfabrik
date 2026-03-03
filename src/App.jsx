import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import PostCard from './components/PostCard';
import FavoritesPanel from './components/FavoritesPanel';
import MobileNav from './components/MobileNav';
import ApiKeyModal from './components/ApiKeyModal';
import { CATEGORY_CONFIG, CATEGORY_ALIASES } from './config/systemPrompt';
import { getApiKey, setApiKey, clearApiKey, callGemini } from './api';

const CATEGORIES = Object.keys(CATEGORY_CONFIG);
const AUTO_REFRESH_MS = 2 * 60 * 60 * 1000; // 2 hours

function parsePosts(textContent) {
  let jsonStr = textContent;

  const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    jsonStr = arrayMatch[0];
  }

  jsonStr = jsonStr.replace(/```json?\s*/g, '').replace(/```\s*/g, '');

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((post) => {
      let cat = post.cat || post.category || 'daily';
      cat = CATEGORY_ALIASES[cat] || cat;
      if (!CATEGORY_CONFIG[cat]) cat = 'daily';

      return {
        id: crypto.randomUUID(),
        cat,
        text: post.text || '',
        hook: post.hook || '',
        template: post.template || null
      };
    });
  } catch (e) {
    console.error('JSON parse error:', e, jsonStr.substring(0, 200));
    return [];
  }
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('fabrik-theme') || 'dark');
  const [hasKey, setHasKey] = useState(() => !!getApiKey());
  const [posts, setPosts] = useState({});
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fabrik-favorites') || '[]'); } catch { return []; }
  });
  const [loading, setLoading] = useState(false);
  const [loadingCat, setLoadingCat] = useState(null);
  const [error, setError] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState('swiss');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [nextRefresh, setNextRefresh] = useState(null);
  const [metrics, setMetrics] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fabrik-metrics') || '{"generated":0,"copied":0,"saved":0}'); }
    catch { return { generated: 0, copied: 0, saved: 0 }; }
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('fabrik-theme', theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem('fabrik-favorites', JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('fabrik-metrics', JSON.stringify(metrics)); }, [metrics]);

  // Auto-refresh timer
  useEffect(() => {
    if (!lastUpdate) return;
    const target = lastUpdate + AUTO_REFRESH_MS;
    setNextRefresh(target);
    const interval = setInterval(() => {
      if (Date.now() >= target) { generateAll(); clearInterval(interval); }
      setNextRefresh(target);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  const handleSaveKey = (key) => {
    setApiKey(key);
    setHasKey(true);
  };

  const handleClearKey = () => {
    clearApiKey();
    setHasKey(false);
  };

  const generateAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const now = new Date();
    const dateStr = now.toLocaleDateString('de-CH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const userMessage = `Es ist ${dateStr}. Generiere genau 10 Posts pro Kategorie (60 total, 6 Kategorien). Nutze Web-Suche für aktuelle Nachrichten von heute. Antworte NUR mit einem validen JSON-Array.`;

    try {
      const textContent = await callGemini(userMessage);
      const allPosts = parsePosts(textContent);

      if (allPosts.length === 0) {
        throw new Error('Keine Posts in der API-Antwort gefunden');
      }

      const grouped = {};
      CATEGORIES.forEach((cat) => { grouped[cat] = allPosts.filter((p) => p.cat === cat); });

      setPosts(grouped);
      setLastUpdate(Date.now());
      setMetrics((m) => ({ ...m, generated: m.generated + allPosts.length }));
    } catch (err) {
      console.error('Generate error:', err);
      if (err.message.includes('API-Key')) { setHasKey(false); }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateCategory = useCallback(async (category) => {
    setLoadingCat(category);
    setError(null);

    const now = new Date();
    const dateStr = now.toLocaleDateString('de-CH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const userMessage = `Es ist ${dateStr}. Generiere genau 10 Posts NUR für die Kategorie "${category}" (${CATEGORY_CONFIG[category].label}). Nutze Web-Suche für aktuelle Nachrichten von heute. Antworte NUR mit einem validen JSON-Array.`;

    try {
      const textContent = await callGemini(userMessage);
      const newPosts = parsePosts(textContent);
      const catPosts = newPosts.map((p) => ({ ...p, cat: category }));

      if (catPosts.length === 0) {
        throw new Error(`Keine Posts für ${CATEGORY_CONFIG[category].label} erhalten`);
      }

      setPosts((prev) => ({ ...prev, [category]: catPosts }));
      setMetrics((m) => ({ ...m, generated: m.generated + catPosts.length }));
    } catch (err) {
      console.error('Generate category error:', err);
      if (err.message.includes('API-Key')) { setHasKey(false); }
      setError(err.message);
    } finally {
      setLoadingCat(null);
    }
  }, []);

  const copyPost = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setMetrics((m) => ({ ...m, copied: m.copied + 1 }));
  }, []);

  const toggleFavorite = useCallback((post) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.id === post.id);
      if (exists) {
        setMetrics((m) => ({ ...m, saved: Math.max(0, m.saved - 1) }));
        return prev.filter((f) => f.id !== post.id);
      }
      setMetrics((m) => ({ ...m, saved: m.saved + 1 }));
      return [...prev, { ...post, savedAt: Date.now() }];
    });
  }, []);

  const updatePost = useCallback((postId, newText) => {
    setPosts((prev) => {
      const next = { ...prev };
      for (const cat of CATEGORIES) {
        if (next[cat]) {
          next[cat] = next[cat].map((p) => p.id === postId ? { ...p, text: newText } : p);
        }
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((postId) => favorites.some((f) => f.id === postId), [favorites]);

  return (
    <div className="min-h-screen">
      {!hasKey && <ApiKeyModal onSave={handleSaveKey} theme={theme} />}

      <Header
        theme={theme}
        setTheme={setTheme}
        metrics={metrics}
        onGenerate={generateAll}
        loading={loading}
        lastUpdate={lastUpdate}
        nextRefresh={nextRefresh}
        onShowFavorites={() => setShowFavorites(true)}
        favCount={favorites.length}
        onClearKey={handleClearKey}
      />

      {error && (
        <div className="mx-4 mt-2 p-3 text-sm" style={{
          background: theme === 'dark' ? '#2D1111' : '#FDE8E8',
          border: '1px solid #E63946', color: '#E63946'
        }}>
          Fehler: {error}
          <button onClick={() => setError(null)} className="ml-4 underline cursor-pointer">Schliessen</button>
        </div>
      )}

      {/* Desktop: 6 columns */}
      <div className="hidden min-[901px]:grid grid-cols-6 gap-0 px-2 pt-2">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="px-1">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: CATEGORY_CONFIG[cat].color }} />
                <span className="text-xs font-semibold uppercase tracking-wider">{CATEGORY_CONFIG[cat].label}</span>
              </div>
              <button
                onClick={() => generateCategory(cat)}
                disabled={loadingCat === cat || loading}
                className="text-[10px] uppercase tracking-wider opacity-50 hover:opacity-100 cursor-pointer disabled:cursor-not-allowed"
              >
                {loadingCat === cat ? '...' : 'Neu'}
              </button>
            </div>
            <div className="column-scroll space-y-2">
              {(loading || loadingCat === cat) && (!posts[cat] || posts[cat].length === 0) && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: CATEGORY_CONFIG[cat].color, borderTopColor: 'transparent' }} />
                </div>
              )}
              {posts[cat]?.map((post) => (
                <PostCard key={post.id} post={post} theme={theme} color={CATEGORY_CONFIG[cat].color}
                  onCopy={copyPost} onToggleFavorite={toggleFavorite} onUpdate={updatePost} isFavorite={isFavorite(post.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: tabs + single column */}
      <div className="min-[901px]:hidden">
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        <div className="px-3 pt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: CATEGORY_CONFIG[activeTab].color }} />
              <span className="text-xs font-semibold uppercase tracking-wider">{CATEGORY_CONFIG[activeTab].label}</span>
            </div>
            <button
              onClick={() => generateCategory(activeTab)}
              disabled={loadingCat === activeTab || loading}
              className="text-[10px] uppercase tracking-wider opacity-50 hover:opacity-100 cursor-pointer disabled:cursor-not-allowed"
            >
              {loadingCat === activeTab ? '...' : 'Neu'}
            </button>
          </div>
          <div className="column-scroll space-y-2 pb-4">
            {(loading || loadingCat === activeTab) && (!posts[activeTab] || posts[activeTab].length === 0) && (
              <div className="flex items-center justify-center py-12">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: CATEGORY_CONFIG[activeTab].color, borderTopColor: 'transparent' }} />
              </div>
            )}
            {posts[activeTab]?.map((post) => (
              <PostCard key={post.id} post={post} theme={theme} color={CATEGORY_CONFIG[activeTab].color}
                onCopy={copyPost} onToggleFavorite={toggleFavorite} onUpdate={updatePost} isFavorite={isFavorite(post.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!loading && Object.keys(posts).length === 0 && hasKey && (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <p className="text-sm opacity-50 mb-4">Noch keine Posts generiert.</p>
          <button onClick={generateAll} className="px-6 py-2 text-sm font-semibold text-white cursor-pointer" style={{ backgroundColor: '#E63946' }}>
            GENERIEREN
          </button>
        </div>
      )}

      <FavoritesPanel show={showFavorites} onClose={() => setShowFavorites(false)} favorites={favorites}
        onRemove={(id) => { setFavorites((prev) => prev.filter((f) => f.id !== id)); setMetrics((m) => ({ ...m, saved: Math.max(0, m.saved - 1) })); }}
        onCopy={copyPost} theme={theme} />
    </div>
  );
}
