import { useLocationStore } from '../../store/locationStore';
import { useUIStore } from '../../store/uiStore';
import { useCameraControls, FISHING_DISTANCE, HOME_DISTANCE } from '../../store/cameraStore';
import { LOCATIONS } from '../../data/locationData';

export default function TravelPanel() {
  const currentLocationId = useLocationStore((s) => s.currentLocationId);
  const setLocation = useLocationStore((s) => s.setLocation);
  const setActivePanel = useUIStore((s) => s.setActivePanel);
  const pushToast = useUIStore((s) => s.pushToast);

  return (
    <div className="travel-panel">
      <p className="fishing-hint">Pick a place to visit. Fishing spots have their own fish to discover.</p>
      <div className="item-grid">
        {LOCATIONS.map((loc) => {
          const current = loc.id === currentLocationId;

          const handleTravel = () => {
            if (current) return;
            setLocation(loc.id);
            useCameraControls.getState().resetView(loc.id === 'home' ? HOME_DISTANCE : FISHING_DISTANCE);
            setActivePanel(null);
            pushToast(`Traveled to ${loc.name}`, 'info');
          };

          return (
            <div key={loc.id} className={`item-card ${current ? 'owned' : ''}`}>
              <div className="item-icon travel-icon">{loc.icon}</div>
              <p className="item-name">{loc.name}</p>
              <p className="item-desc">{loc.description}</p>
              <div className="item-footer">
                <span className={`travel-tag ${loc.fishable ? 'travel-tag-fish' : 'travel-tag-home'}`}>
                  {loc.fishable ? '🎣 Fishing' : '🏠 Home'}
                </span>
                {current ? (
                  <span className="equipped-badge">Here</span>
                ) : (
                  <button className="buy-button" onClick={handleTravel}>
                    Travel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
