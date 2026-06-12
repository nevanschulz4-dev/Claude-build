import { useUIStore } from '../../store/uiStore';
import { useGameStore } from '../../store/gameStore';
import type { PanelId } from '../../store/uiStore';

const TABS: { id: PanelId; label: string; icon: string }[] = [
  { id: 'travel', label: 'Travel', icon: '🗺️' },
  { id: 'fishing', label: 'Fish', icon: '🎣' },
  { id: 'build', label: 'Build', icon: '🏞️' },
  { id: 'shop', label: 'Shop', icon: '🛒' },
  { id: 'inventory', label: 'Inventory', icon: '🐟' },
];

export default function BottomNav() {
  const activePanel = useUIStore((s) => s.activePanel);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const inventoryCount = useGameStore((s) => s.inventory.length);

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`nav-button ${activePanel === tab.id ? 'active' : ''}`}
          onClick={() => setActivePanel(tab.id)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
          {tab.id === 'inventory' && inventoryCount > 0 && <span className="nav-badge">{inventoryCount}</span>}
        </button>
      ))}
    </nav>
  );
}
