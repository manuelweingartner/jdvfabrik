import { CATEGORY_CONFIG } from '../config/systemPrompt';

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

export default function MobileNav({ activeTab, setActiveTab, theme }) {
  const borderColor = theme === 'dark' ? '#2A2A2A' : '#D4D0CB';
  const bgColor = theme === 'dark' ? '#0A0A0A' : '#F5F0EB';

  return (
    <div
      className="flex overflow-x-auto gap-0 sticky top-[57px] z-40"
      style={{ backgroundColor: bgColor, borderBottom: `1px solid ${borderColor}` }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = activeTab === cat;
        return (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className="flex-shrink-0 px-3 py-2 text-[10px] uppercase tracking-wider cursor-pointer transition-opacity"
            style={{
              opacity: isActive ? 1 : 0.4,
              borderBottom: isActive ? `2px solid ${CATEGORY_CONFIG[cat].color}` : '2px solid transparent',
              fontWeight: isActive ? 600 : 400
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle"
              style={{ backgroundColor: CATEGORY_CONFIG[cat].color }}
            />
            {CATEGORY_CONFIG[cat].label.split(' ')[0]}
          </button>
        );
      })}
    </div>
  );
}
