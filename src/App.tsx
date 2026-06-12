import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './components/scene/Experience';
import HUD from './components/ui/HUD';
import BottomNav from './components/ui/BottomNav';
import Toasts from './components/ui/Toasts';
import FishingPanel from './components/ui/FishingPanel';
import BuildPanel from './components/ui/BuildPanel';
import ShopPanel from './components/ui/ShopPanel';
import InventoryPanel from './components/ui/InventoryPanel';
import TravelPanel from './components/ui/TravelPanel';
import EncyclopediaPanel from './components/ui/EncyclopediaPanel';
import QuestsPanel from './components/ui/QuestsPanel';
import AchievementsPanel from './components/ui/AchievementsPanel';
import TouchControls from './components/ui/TouchControls';
import { useUIStore } from './store/uiStore';
import './styles/ui.css';

const PANEL_TITLES: Record<string, string> = {
  fishing: 'Fishing',
  build: 'Build & Customize',
  shop: 'Shop',
  inventory: 'Inventory',
  travel: 'Travel',
  encyclopedia: 'Fish Encyclopedia',
  quests: 'Daily Quests',
  achievements: 'Achievements',
};

function ActivePanel() {
  const activePanel = useUIStore((s) => s.activePanel);
  const setActivePanel = useUIStore((s) => s.setActivePanel);

  if (!activePanel) return null;

  return (
    <div className="panel-overlay">
      <div className="panel-header">
        <h2>{PANEL_TITLES[activePanel]}</h2>
        <button className="panel-close" onClick={() => setActivePanel(null)}>
          ✕
        </button>
      </div>
      <div className="panel-body">
        {activePanel === 'fishing' && <FishingPanel />}
        {activePanel === 'build' && <BuildPanel />}
        {activePanel === 'shop' && <ShopPanel />}
        {activePanel === 'inventory' && <InventoryPanel />}
        {activePanel === 'travel' && <TravelPanel />}
        {activePanel === 'encyclopedia' && <EncyclopediaPanel />}
        {activePanel === 'quests' && <QuestsPanel />}
        {activePanel === 'achievements' && <AchievementsPanel />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-root">
      <Canvas shadows camera={{ position: [0, 7, 13], fov: 42 }}>
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>

      <TouchControls />

      <div className="ui-overlay">
        <HUD />
        <Toasts />
        <ActivePanel />
        <BottomNav />
      </div>
    </div>
  );
}
