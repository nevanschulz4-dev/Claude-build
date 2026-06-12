import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { FISH_SPECIES } from '../../data/fishData';
import { ROD_UPGRADES, WATER_THEMES } from '../../data/decorData';
import { RARITY_COLORS } from '../../data/types';

const RARITY_LABEL: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'LEGENDARY',
};

type ShopTab = 'fish' | 'rods' | 'water';

const TABS: { id: ShopTab; label: string }[] = [
  { id: 'fish', label: 'Fish' },
  { id: 'rods', label: 'Rods' },
  { id: 'water', label: 'Water' },
];

export default function ShopPanel() {
  const [tab, setTab] = useState<ShopTab>('fish');
  const money = useGameStore((s) => s.money);

  return (
    <div className="shop-panel">
      <div className="hud-pill hud-money shop-money">💰 ${money.toLocaleString()}</div>

      <div className="tab-row">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-button ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'fish' && <FishTab />}
      {tab === 'rods' && <RodsTab />}
      {tab === 'water' && <WaterTab />}
    </div>
  );
}

function FishTab() {
  const money = useGameStore((s) => s.money);
  const unlockedFishIds = useGameStore((s) => s.unlockedFishIds);
  const unlockFish = useGameStore((s) => s.unlockFish);
  const pushToast = useUIStore((s) => s.pushToast);

  return (
    <div className="item-grid">
      {FISH_SPECIES.map((species) => {
        const unlocked = unlockedFishIds.includes(species.id);
        const canAfford = money >= species.unlockCost;

        const handleBuy = () => {
          const success = unlockFish(species.id, species.unlockCost);
          if (success) {
            pushToast(`Unlocked ${species.name}!`, 'success');
          } else {
            pushToast('Not enough money!', 'warning');
          }
        };

        return (
          <div key={species.id} className={`item-card ${unlocked ? 'owned' : ''}`}>
            <div className="item-icon" style={{ background: species.primaryColor }}>
              🐟
            </div>
            <div className="rarity-badge" style={{ background: RARITY_COLORS[species.rarity] }}>
              {RARITY_LABEL[species.rarity]}
            </div>
            <p className="item-name">{species.name}</p>
            <p className="item-desc">{species.description}</p>
            <div className="item-footer">
              {unlocked ? (
                <span className="owned-badge">Unlocked</span>
              ) : (
                <>
                  <span className="item-cost">${species.unlockCost.toLocaleString()}</span>
                  <button className="buy-button" disabled={!canAfford} onClick={handleBuy}>
                    Unlock
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function statPercent(value: number, max: number) {
  return Math.min(100, Math.round((value / max) * 100));
}

function RodsTab() {
  const money = useGameStore((s) => s.money);
  const rodId = useGameStore((s) => s.rodId);
  const ownedRodIds = useGameStore((s) => s.ownedRodIds);
  const buyRod = useGameStore((s) => s.buyRod);
  const pushToast = useUIStore((s) => s.pushToast);

  return (
    <div className="item-grid">
      {ROD_UPGRADES.map((rod) => {
        const equipped = rodId === rod.id;
        const owned = ownedRodIds.includes(rod.id);
        const canAfford = money >= rod.cost;

        const handleClick = () => {
          const success = buyRod(rod.id, rod.cost);
          if (success) {
            pushToast(`Equipped ${rod.name}!`, 'success');
          } else {
            pushToast('Not enough money!', 'warning');
          }
        };

        return (
          <div key={rod.id} className={`item-card ${owned ? 'owned' : ''}`}>
            <div className="item-icon">🎣</div>
            <p className="item-name">{rod.name}</p>
            <p className="item-desc">{rod.description}</p>
            <div className="rod-stats">
              <div className="rod-stat-row">
                <span className="rod-stat-label">Luck</span>
                <div className="rod-stat-bar">
                  <div className="rod-stat-fill rod-stat-luck" style={{ width: `${statPercent(rod.luckBonus, 0.6)}%` }} />
                </div>
              </div>
              <div className="rod-stat-row">
                <span className="rod-stat-label">Speed</span>
                <div className="rod-stat-bar">
                  <div className="rod-stat-fill rod-stat-speed" style={{ width: `${statPercent(rod.speedBonus, 0.6)}%` }} />
                </div>
              </div>
              <div className="rod-stat-row">
                <span className="rod-stat-label">Reel</span>
                <div className="rod-stat-bar">
                  <div className="rod-stat-fill rod-stat-reel" style={{ width: `${statPercent(rod.reelWindowBonus, 0.3)}%` }} />
                </div>
              </div>
            </div>
            <div className="item-footer">
              {equipped ? (
                <span className="equipped-badge">Equipped</span>
              ) : owned ? (
                <>
                  <span className="owned-badge">Owned</span>
                  <button className="buy-button" onClick={handleClick}>
                    Equip
                  </button>
                </>
              ) : (
                <>
                  <span className="item-cost">${rod.cost.toLocaleString()}</span>
                  <button className="buy-button" disabled={!canAfford} onClick={handleClick}>
                    Buy
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WaterTab() {
  const money = useGameStore((s) => s.money);
  const waterThemeId = useGameStore((s) => s.waterThemeId);
  const ownedWaterThemeIds = useGameStore((s) => s.ownedWaterThemeIds);
  const setWaterTheme = useGameStore((s) => s.setWaterTheme);
  const pushToast = useUIStore((s) => s.pushToast);

  return (
    <div className="item-grid">
      {WATER_THEMES.map((theme) => {
        const equipped = waterThemeId === theme.id;
        const owned = ownedWaterThemeIds.includes(theme.id);
        const canAfford = money >= theme.cost;

        const handleClick = () => {
          const success = setWaterTheme(theme.id, theme.cost);
          if (success) {
            pushToast(`Applied ${theme.name} theme!`, 'success');
          } else {
            pushToast('Not enough money!', 'warning');
          }
        };

        return (
          <div key={theme.id} className={`item-card ${owned ? 'owned' : ''}`}>
            <div className="theme-swatch-row">
              <div className="theme-swatch" style={{ background: theme.shallow }} />
              <div className="theme-swatch" style={{ background: theme.deep }} />
              <div className="theme-swatch" style={{ background: theme.foam }} />
            </div>
            <p className="item-name">{theme.name}</p>
            <p className="item-desc">Shallow, deep &amp; foam water colors.</p>
            <div className="item-footer">
              {equipped ? (
                <span className="equipped-badge">Equipped</span>
              ) : owned ? (
                <>
                  <span className="owned-badge">Owned</span>
                  <button className="buy-button" onClick={handleClick}>
                    Equip
                  </button>
                </>
              ) : (
                <>
                  <span className="item-cost">${theme.cost.toLocaleString()}</span>
                  <button className="buy-button" disabled={!canAfford} onClick={handleClick}>
                    Buy
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
