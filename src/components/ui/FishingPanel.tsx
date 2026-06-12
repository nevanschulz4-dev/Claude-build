import { useEffect, useRef } from 'react';
import { useFishingStore } from '../../store/fishingStore';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { RARITY_COLORS } from '../../data/types';

const RARITY_LABEL: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'LEGENDARY',
};

export default function FishingPanel() {
  const phase = useFishingStore((s) => s.phase);
  const castTimer = useFishingStore((s) => s.castTimer);
  const biteWindowTimer = useFishingStore((s) => s.biteWindowTimer);
  const biteWindowMax = useFishingStore((s) => s.biteWindowMax);
  const pendingFish = useFishingStore((s) => s.pendingFish);
  const reelMarker = useFishingStore((s) => s.reelMarker);
  const reelProgress = useFishingStore((s) => s.reelProgress);
  const reelZoneCenter = useFishingStore((s) => s.reelZoneCenter);
  const reelZoneWidth = useFishingStore((s) => s.reelZoneWidth);
  const result = useFishingStore((s) => s.result);

  const cast = useFishingStore((s) => s.cast);
  const cancel = useFishingStore((s) => s.cancel);
  const hook = useFishingStore((s) => s.hook);
  const setReeling = useFishingStore((s) => s.setReeling);
  const acknowledgeResult = useFishingStore((s) => s.acknowledgeResult);

  const pushToast = useUIStore((s) => s.pushToast);
  const announced = useRef(false);

  useEffect(() => {
    if (phase === 'result' && !announced.current) {
      announced.current = true;
      if (result && typeof result === 'object') {
        pushToast(`Caught a ${result.species.name}! +$${result.value}`, 'success');
      } else if (result === 'escaped') {
        pushToast('The fish got away!', 'warning');
      } else if (result === 'missed') {
        pushToast('Too slow — the bite passed!', 'warning');
      }
    }
    if (phase !== 'result') announced.current = false;
  }, [phase, result, pushToast]);

  // Keyboard support: space to hook / hold-to-reel
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      if (phase === 'bite') hook();
      if (phase === 'reeling') setReeling(true);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (phase === 'reeling') setReeling(false);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [phase, hook, setReeling]);

  return (
    <div className="fishing-panel">
      {phase === 'idle' && (
        <div className="fishing-stage">
          <p className="fishing-hint">Cast your line into the pond and wait for a bite.</p>
          <button className="btn btn-cast" onClick={cast}>
            🎣 Cast Line
          </button>
        </div>
      )}

      {phase === 'casting' && (
        <div className="fishing-stage">
          <p className="fishing-hint">Casting{'.'.repeat(1 + Math.floor((1 - castTimer) * 3))}</p>
        </div>
      )}

      {phase === 'waiting' && (
        <div className="fishing-stage">
          <p className="fishing-hint pulse">Waiting for a bite…</p>
          <button className="btn btn-secondary" onClick={cancel}>
            Reel In
          </button>
        </div>
      )}

      {phase === 'bite' && (
        <div className="fishing-stage">
          <p className="fishing-hint shout">A fish is biting!</p>
          <button className="btn btn-hook" onClick={hook}>
            HOOK IT!
          </button>
          <div className="timer-bar">
            <div className="timer-bar-fill" style={{ width: `${(biteWindowTimer / biteWindowMax) * 100}%` }} />
          </div>
        </div>
      )}

      {phase === 'reeling' && pendingFish && (
        <div className="fishing-stage reeling-stage">
          <p className="fishing-hint">
            Reeling in a <span style={{ color: RARITY_COLORS[pendingFish.species.rarity] }}>{pendingFish.species.name}</span>!
          </p>
          <div className="reel-area">
            <div className="reel-bar">
              <div
                className="reel-zone"
                style={{
                  height: `${reelZoneWidth * 100}%`,
                  bottom: `${(reelZoneCenter - reelZoneWidth / 2) * 100}%`,
                }}
              />
              <div className="reel-marker" style={{ bottom: `calc(${reelMarker * 100}% - 6px)` }} />
            </div>
            <div className="progress-bar-vertical">
              <div className="progress-bar-fill-vertical" style={{ height: `${reelProgress * 100}%` }} />
            </div>
          </div>
          <button
            className="btn btn-reel"
            onPointerDown={() => setReeling(true)}
            onPointerUp={() => setReeling(false)}
            onPointerLeave={() => setReeling(false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            HOLD TO REEL
          </button>
        </div>
      )}

      {phase === 'result' && (
        <div className="fishing-stage">
          {result && typeof result === 'object' ? (
            <div className="result-card" style={{ borderColor: RARITY_COLORS[result.species.rarity] }}>
              <div className="result-icon" style={{ background: result.species.primaryColor }}>
                🐟
              </div>
              <div className="result-info">
                <div className="rarity-badge" style={{ background: RARITY_COLORS[result.species.rarity] }}>
                  {RARITY_LABEL[result.species.rarity]}
                </div>
                <h3>{result.species.name}</h3>
                <p>{result.weight} kg</p>
                <p className="result-value">+${result.value}</p>
              </div>
            </div>
          ) : (
            <div className="result-card result-fail">
              <div className="result-icon">💧</div>
              <div className="result-info">
                <h3>{result === 'missed' ? 'Too slow!' : 'It got away!'}</h3>
                <p>Better luck next cast.</p>
              </div>
            </div>
          )}
          <button className="btn btn-cast" onClick={acknowledgeResult}>
            Continue
          </button>
        </div>
      )}

      <FishingFooter />
    </div>
  );
}

function FishingFooter() {
  const inventoryCount = useGameStore((s) => s.inventory.length);
  return <p className="fishing-footer">Inventory: {inventoryCount}/16</p>;
}
