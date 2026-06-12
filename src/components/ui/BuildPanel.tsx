import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { DECORATIONS, DECOR_BY_ID } from '../../data/decorData';
import type { DecorationCategory } from '../../data/types';

type CategoryFilter = 'all' | DecorationCategory;

const CATEGORY_TABS: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'plant', label: 'Plants' },
  { id: 'rock', label: 'Rocks' },
  { id: 'structure', label: 'Structures' },
  { id: 'light', label: 'Lighting' },
  { id: 'path', label: 'Paths' },
  { id: 'fun', label: 'Decor' },
];

const DECOR_ICONS: Record<string, string> = {
  reed: '🌾',
  lilypad: '🪷',
  bonsai: '🌳',
  flowerbed: '🌸',
  'rock-small': '🪨',
  'rock-arch': '⛩️',
  crystal: '💎',
  bridge: '🌉',
  pagoda: '🏯',
  fountain: '⛲',
  lantern: '🏮',
  'firefly-jar': '🫙',
  'tiki-torch': '🔥',
  'path-stone': '🟫',
  flamingo: '🦩',
  umbrella: '⛱️',
  gnome: '🧙',
  birdhouse: '🏠',
};

export default function BuildPanel() {
  const [tab, setTab] = useState<CategoryFilter>('all');
  const money = useGameStore((s) => s.money);
  const placedDecorations = useGameStore((s) => s.placedDecorations);
  const pondRating = useGameStore((s) => s.pondRating());
  const buildSelection = useUIStore((s) => s.buildSelection);
  const setBuildSelection = useUIStore((s) => s.setBuildSelection);
  const buildRemoveMode = useUIStore((s) => s.buildRemoveMode);
  const setBuildRemoveMode = useUIStore((s) => s.setBuildRemoveMode);
  const rotateBuildSelection = useUIStore((s) => s.rotateBuildSelection);

  const items = tab === 'all' ? DECORATIONS : DECORATIONS.filter((d) => d.category === tab);

  const selectedDef = buildSelection ? DECOR_BY_ID[buildSelection] : null;

  return (
    <div className="build-panel">
      <p className="build-intro">
        Tap an item, then tap on the grass around your pond to place it. Use the{' '}
        <strong>Rotate</strong> button (or press <strong>R</strong>) to spin it before placing.
      </p>

      <div className="build-stats">
        <div className="hud-pill hud-money">💰 ${money.toLocaleString()}</div>
        <div className="hud-pill">✨ Rating: {pondRating}</div>
        <div className="hud-pill">🧩 Placed: {placedDecorations.length}</div>
      </div>

      <button
        className={`remove-mode-button ${buildRemoveMode ? 'active' : ''}`}
        onClick={() => setBuildRemoveMode(!buildRemoveMode)}
      >
        {buildRemoveMode ? '🗑️ Remove Mode: ON' : '🗑️ Remove Decorations'}
      </button>
      {buildRemoveMode && (
        <p className="build-hint">Click a placed decoration in the scene to remove it.</p>
      )}

      <div className="tab-row">
        {CATEGORY_TABS.map((c) => (
          <button
            key={c.id}
            className={`tab-button ${tab === c.id ? 'active' : ''}`}
            onClick={() => setTab(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="item-grid">
        {items.map((def) => {
          const selected = buildSelection === def.id;
          const canAfford = money >= def.cost;

          const handleClick = () => {
            setBuildSelection(selected ? null : def.id);
          };

          return (
            <div key={def.id} className={`item-card ${selected ? 'selected' : ''}`} onClick={handleClick}>
              <div className="item-icon">{DECOR_ICONS[def.id] ?? '🎁'}</div>
              <p className="item-name">{def.name}</p>
              <p className="item-desc">{def.description}</p>
              <div className="item-footer">
                <span className="item-cost">${def.cost.toLocaleString()}</span>
                <span className="item-rating">+{def.ratingValue} rating</span>
              </div>
              {!canAfford && <span className="item-warning">Not enough money</span>}
            </div>
          );
        })}
      </div>

      {selectedDef && (
        <div className="build-banner">
          <span>Placing: {selectedDef.name}</span>
          <button className="build-rotate-button" onClick={() => rotateBuildSelection()}>
            ↻ Rotate
          </button>
          <button onClick={() => setBuildSelection(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
