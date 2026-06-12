import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useEnvironmentStore } from '../../store/environmentStore';
import { setMuted } from '../../utils/audio';

function timeLabel(timeOfDay: number): { icon: string; label: string } {
  if (timeOfDay < 0.22 || timeOfDay > 0.86) return { icon: '🌙', label: 'Night' };
  if (timeOfDay < 0.3) return { icon: '🌅', label: 'Sunrise' };
  if (timeOfDay < 0.68) return { icon: '☀️', label: 'Day' };
  if (timeOfDay < 0.8) return { icon: '🌇', label: 'Sunset' };
  return { icon: '🌆', label: 'Dusk' };
}

export default function HUD() {
  const money = useGameStore((s) => s.money);
  const pondRating = useGameStore((s) => s.pondRating());
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const timeOfDay = useEnvironmentStore((s) => s.timeOfDay);
  const weather = useEnvironmentStore((s) => s.weather);

  useEffect(() => {
    setMuted(!soundEnabled);
  }, [soundEnabled]);

  const { icon, label } = timeLabel(timeOfDay);

  return (
    <div className="hud-bar">
      <div className="hud-pill hud-title">🐠 Pond Tycoon</div>
      <div className="hud-pill hud-money">💰 ${money.toLocaleString()}</div>
      <div className="hud-pill hud-rating">⭐ Pond Rating: {pondRating}</div>
      <div className="hud-pill hud-time">
        {icon} {label}
        {weather === 'rain' && ' 🌧️'}
      </div>
      <button className="hud-pill hud-sound-toggle" onClick={toggleSound} aria-label="Toggle sound">
        {soundEnabled ? '🔊' : '🔇'}
      </button>
    </div>
  );
}
