import { useGameStore } from '../../store/gameStore';

export default function HUD() {
  const money = useGameStore((s) => s.money);
  const pondRating = useGameStore((s) => s.pondRating());

  return (
    <div className="hud-bar">
      <div className="hud-pill hud-title">🐠 Pond Tycoon</div>
      <div className="hud-pill hud-money">💰 ${money.toLocaleString()}</div>
      <div className="hud-pill hud-rating">⭐ Pond Rating: {pondRating}</div>
    </div>
  );
}
