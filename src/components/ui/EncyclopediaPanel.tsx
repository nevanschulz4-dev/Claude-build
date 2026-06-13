import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { FISH_SPECIES } from '../../data/fishData';
import { RARITY_COLORS, RARITY_ORDER } from '../../data/types';
import type { Rarity } from '../../data/types';
import { LOCATION_BY_ID } from '../../data/locationData';

const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'LEGENDARY',
};

type FilterTab = 'all' | Rarity;

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  ...RARITY_ORDER.map((r) => ({ id: r, label: RARITY_LABEL[r] })),
];

export default function EncyclopediaPanel() {
  const [tab, setTab] = useState<FilterTab>('all');
  const unlockedFishIds = useGameStore((s) => s.unlockedFishIds);
  const caughtSpeciesIds = useGameStore((s) => s.caughtSpeciesIds);
  const bestCatchWeights = useGameStore((s) => s.bestCatchWeights);
  const hiddenPondFishIds = useGameStore((s) => s.hiddenPondFishIds);
  const togglePondFishVisibility = useGameStore((s) => s.togglePondFishVisibility);

  const species = tab === 'all' ? FISH_SPECIES : FISH_SPECIES.filter((f) => f.rarity === tab);

  return (
    <div className="encyclopedia-panel">
      <div className="inventory-stats">
        <div className="hud-pill">
          📖 Discovered: {caughtSpeciesIds.length}/{FISH_SPECIES.length}
        </div>
        <div className="hud-pill">
          🔓 Unlocked: {unlockedFishIds.length}/{FISH_SPECIES.length}
        </div>
      </div>
      <p className="build-intro">
        Toggle <strong>In Pond</strong> on an unlocked species to choose which fish swim in your home pond.
      </p>

      <div className="tab-row">
        {TABS.map((t) => (
          <button key={t.id} className={`tab-button ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="item-grid">
        {species.map((sp) => {
          const unlocked = unlockedFishIds.includes(sp.id);
          const caught = caughtSpeciesIds.includes(sp.id);
          const known = unlocked || caught;

          return (
            <div key={sp.id} className={`item-card encyclopedia-card ${caught ? 'discovered' : ''}`}>
              <div
                className="item-icon"
                style={{ background: known ? sp.primaryColor : '#2a2f45', filter: caught ? 'none' : 'grayscale(1) brightness(0.6)' }}
              >
                {caught ? '🐟' : known ? '🔒' : '❓'}
              </div>
              <div className="rarity-badge" style={{ background: RARITY_COLORS[sp.rarity] }}>
                {RARITY_LABEL[sp.rarity]}
              </div>
              <p className="item-name">{known ? sp.name : '???'}</p>
              <p className="item-desc">
                {caught
                  ? sp.description
                  : unlocked
                    ? 'Unlocked — go catch one to complete this entry!'
                    : 'Unlock this species in the Shop to learn more.'}
              </p>
              {known && (
                <div className="encyclopedia-habitats">
                  {sp.habitats.map((h) => (
                    <span key={h} className="travel-tag travel-tag-fish" title={LOCATION_BY_ID[h].name}>
                      {LOCATION_BY_ID[h].icon} {LOCATION_BY_ID[h].name}
                    </span>
                  ))}
                </div>
              )}
              {caught && bestCatchWeights[sp.id] != null && (
                <p className="item-desc">🏆 Personal best: {bestCatchWeights[sp.id]} kg</p>
              )}
              <div className="item-footer">
                <span className="item-cost">{caught ? `💰 ~$${sp.baseValue}` : ' '}</span>
                {caught && <span className="owned-badge">Caught!</span>}
              </div>
              {unlocked && (
                <button
                  className={`pond-visibility-toggle ${hiddenPondFishIds.includes(sp.id) ? 'hidden' : 'visible'}`}
                  onClick={() => togglePondFishVisibility(sp.id)}
                >
                  {hiddenPondFishIds.includes(sp.id) ? '🚫 Hidden from Pond' : '🌊 In Pond'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
