import { CATEGORY_CONFIG } from '../config/systemPrompt';

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

const SHORT_LABELS = {
  swiss: 'CH',
  intl: 'Welt',
  solidarity: 'Soli',
  pop: 'Pop',
  daily: 'Alltag',
  meme: 'Meme'
};

export default function MobileNav({ activeTab, setActiveTab, theme }) {
  const borderColor = theme === 'dark' ? '#2A2A2A' : '#D4D0CB';
  const bgColor = theme === 'dark' ? '#0A0A0A' : '#F5F0EB';

  return (
    <div
      className="flex sticky top-[45px] z-40"
      style={{ backgroundColor: bgColor, borderBottom: `1px solid ${borderColor}` }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeTab === cat;
        return (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className="flex-1 py-2 text-[11px] font-medium text-center cursor-pointer transition-opacity"
            style={{
              opacity: isActive ? 1 : 0.35,
              borderBottom: isActive ? `2px solid ${CATEGORY_CONFIG[cat].color}` : '2px solid transparent',
              color: isActive ? CATEGORY_CONFIG[cat].color : 'inherit'
            }}
          >
            {SHORT_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );
}
