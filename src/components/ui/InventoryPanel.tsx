import { useGameStore, MAX_INVENTORY } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { FISH_BY_ID } from '../../data/fishData';
import { RARITY_COLORS } from '../../data/types';
import { playCoin } from '../../utils/audio';

const RARITY_LABEL: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'LEGENDARY',
};

export default function InventoryPanel() {
  const money = useGameStore((s) => s.money);
  const inventory = useGameStore((s) => s.inventory);
  const totalCatches = useGameStore((s) => s.totalCatches);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const sellFish = useGameStore((s) => s.sellFish);
  const sellAll = useGameStore((s) => s.sellAll);
  const pushToast = useUIStore((s) => s.pushToast);

  const handleSellAll = () => {
    const total = inventory.reduce((sum, f) => sum + f.value, 0);
    if (total === 0) return;
    sellAll();
    playCoin();
    pushToast(`Sold all fish for $${total.toLocaleString()}!`, 'success');
  };

  const handleSell = (uid: string) => {
    const fish = inventory.find((f) => f.uid === uid);
    if (!fish) return;
    const species = FISH_BY_ID[fish.speciesId];
    sellFish(uid);
    playCoin();
    pushToast(`Sold ${species?.name ?? 'fish'} for $${fish.value.toLocaleString()}`, 'success');
  };

  return (
    <div className="inventory-panel">
      <div className="inventory-stats">
        <div className="hud-pill hud-money">💰 ${money.toLocaleString()}</div>
        <div className="hud-pill">🐟 {inventory.length}/{MAX_INVENTORY}</div>
        <div className="hud-pill">🎯 Catches: {totalCatches}</div>
        <div className="hud-pill">📈 Earned: ${totalEarned.toLocaleString()}</div>
      </div>

      <div className="inventory-actions">
        <button className="btn btn-cast" disabled={inventory.length === 0} onClick={handleSellAll}>
          Sell All
        </button>
      </div>

      {inventory.length === 0 ? (
        <div className="empty-state">Your tank is empty! Go fishing to catch some fish.</div>
      ) : (
        <div className="item-grid">
          {inventory.map((fish) => {
            const species = FISH_BY_ID[fish.speciesId];
            if (!species) return null;
            return (
              <div key={fish.uid} className="item-card">
                <div className="item-icon" style={{ background: species.primaryColor }}>
                  🐟
                </div>
                <div className="rarity-badge" style={{ background: RARITY_COLORS[species.rarity] }}>
                  {RARITY_LABEL[species.rarity]}
                </div>
                <p className="item-name">{species.name}</p>
                <p className="item-desc">{fish.weight.toFixed(2)} kg</p>
                <div className="item-footer">
                  <span className="item-cost">💰 ${fish.value.toLocaleString()}</span>
                  <button className="sell-button" onClick={() => handleSell(fish.uid)}>
                    Sell
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
