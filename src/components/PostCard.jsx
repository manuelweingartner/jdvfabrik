import { useState } from 'react';

export default function PostCard({
  post,
  theme,
  color,
  onCopy,
  onToggleFavorite,
  onUpdate,
  isFavorite
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [copied, setCopied] = useState(false);

  const cardBg = theme === 'dark' ? '#161616' : '#FFFFFF';
  const borderColor = theme === 'dark' ? '#2A2A2A' : '#D4D0CB';
  const mutedText = theme === 'dark' ? '#666' : '#999';

  const handleCopy = () => {
    onCopy(post.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = () => {
    if (editText.length <= 300) {
      onUpdate(post.id, editText);
      setEditing(false);
    }
  };

  const charCount = editText.length;
  const charColor = charCount > 300 ? '#E63946' : charCount > 270 ? '#E76F51' : mutedText;

  return (
    <div
      className="relative"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderTop: `2px solid ${color}`
      }}
    >
      <div className="p-3">
        {editing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-transparent text-sm leading-relaxed resize-none outline-none"
              style={{ minHeight: 80, fontFamily: "'JetBrains Mono', monospace" }}
              maxLength={350}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px]" style={{ color: charColor }}>
                {charCount}/300
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditText(post.text);
                    setEditing(false);
                  }}
                  className="text-[10px] uppercase tracking-wider opacity-50 hover:opacity-100 cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={charCount > 300}
                  className="text-[10px] uppercase tracking-wider cursor-pointer disabled:opacity-30"
                  style={{ color }}
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{post.text}</p>
        )}

        {/* Meme template */}
        {post.template && !editing && (
          <p
            className="text-[10px] mt-2 leading-snug"
            style={{ color: mutedText }}
          >
            [BILD: {post.template}]
          </p>
        )}

        {/* News hook */}
        {post.hook && !editing && (
          <p
            className="text-[10px] mt-2 leading-snug italic"
            style={{ color: mutedText }}
          >
            {post.hook}
          </p>
        )}
      </div>

      {/* Actions */}
      {!editing && (
        <div
          className="flex items-center gap-0 border-t"
          style={{ borderColor }}
        >
          <button
            onClick={handleCopy}
            className="flex-1 py-1.5 text-[10px] uppercase tracking-wider opacity-40 hover:opacity-100 cursor-pointer transition-opacity"
          >
            {copied ? 'Kopiert!' : 'Kopieren'}
          </button>
          <span style={{ color: borderColor }}>|</span>
          <button
            onClick={() => {
              setEditText(post.text);
              setEditing(true);
            }}
            className="flex-1 py-1.5 text-[10px] uppercase tracking-wider opacity-40 hover:opacity-100 cursor-pointer transition-opacity"
          >
            Bearbeiten
          </button>
          <span style={{ color: borderColor }}>|</span>
          <button
            onClick={() => onToggleFavorite(post)}
            className="flex-1 py-1.5 text-[10px] uppercase tracking-wider cursor-pointer transition-opacity"
            style={{ opacity: isFavorite ? 1 : 0.4, color: isFavorite ? color : 'inherit' }}
          >
            {isFavorite ? 'Gemerkt' : 'Merken'}
          </button>
        </div>
      )}
    </div>
  );
}
