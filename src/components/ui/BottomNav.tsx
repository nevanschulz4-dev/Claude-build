import { useUIStore } from '../../store/uiStore';
import { useGameStore } from '../../store/gameStore';
import { useQuestStore } from '../../store/questStore';
import { useAchievementStore } from '../../store/achievementStore';
import { ACHIEVEMENTS } from '../../data/achievementData';
import type { PanelId } from '../../store/uiStore';

const TABS: { id: PanelId; label: string; icon: string }[] = [
  { id: 'travel', label: 'Travel', icon: '🗺️' },
  { id: 'fishing', label: 'Fish', icon: '🎣' },
  { id: 'quests', label: 'Quests', icon: '📋' },
  { id: 'achievements', label: 'Awards', icon: '🏆' },
  { id: 'build', label: 'Build', icon: '🏞️' },
  { id: 'shop', label: 'Shop', icon: '🛒' },
  { id: 'inventory', label: 'Inventory', icon: '🐟' },
  { id: 'encyclopedia', label: 'Fishdex', icon: '📖' },
];

export default function BottomNav() {
  const activePanel = useUIStore((s) => s.activePanel);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const inventoryCount = useGameStore((s) => s.inventory.length);
  const claimableQuests = useQuestStore((s) => s.quests.filter((q) => !q.claimed && q.progress >= q.target).length);

  const totalCatches = useGameStore((s) => s.totalCatches);
  const speciesDiscovered = useGameStore((s) => s.caughtSpeciesIds.length);
  const totalEarned = useGameStore((s) => s.totalEarned);
  const rarityCatchCounts = useGameStore((s) => s.rarityCatchCounts);
  const nightCatches = useGameStore((s) => s.nightCatches);
  const rainCatches = useGameStore((s) => s.rainCatches);
  const decorationsPlaced = useGameStore((s) => s.placedDecorations.length);
  const visitedLocations = useGameStore((s) => s.visitedLocations);
  const rodsOwned = useGameStore((s) => s.ownedRodIds.length);
  const waterThemesOwned = useGameStore((s) => s.ownedWaterThemeIds.length);
  const questsClaimed = useQuestStore((s) => s.totalClaimed);
  const claimedAchievementIds = useAchievementStore((s) => s.claimedIds);

  const ctx = {
    totalCatches,
    speciesDiscovered,
    totalEarned,
    rarityCatchCounts,
    nightCatches,
    rainCatches,
    decorationsPlaced,
    fishableLocationsVisited: visitedLocations.filter((id) => id !== 'home').length,
    questsClaimed,
    rodsOwned,
    waterThemesOwned,
  };
  const claimableAchievements = ACHIEVEMENTS.filter(
    (a) => !claimedAchievementIds.includes(a.id) && a.progress(ctx) >= a.target,
  ).length;

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
          {tab.id === 'quests' && claimableQuests > 0 && <span className="nav-badge">{claimableQuests}</span>}
          {tab.id === 'achievements' && claimableAchievements > 0 && <span className="nav-badge">{claimableAchievements}</span>}
        </button>
      ))}
    </nav>
  );
}
