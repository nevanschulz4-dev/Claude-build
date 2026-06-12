import { useGameStore } from '../../store/gameStore';
import { useQuestStore } from '../../store/questStore';
import { useAchievementStore } from '../../store/achievementStore';
import { useUIStore } from '../../store/uiStore';
import { ACHIEVEMENTS } from '../../data/achievementData';
import type { AchievementContext } from '../../data/achievementData';
import { playCoin } from '../../utils/audio';

export default function AchievementsPanel() {
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
  const heaviestCatch = useGameStore((s) => Math.max(0, ...Object.values(s.bestCatchWeights)));
  const questsClaimed = useQuestStore((s) => s.totalClaimed);
  const claimedIds = useAchievementStore((s) => s.claimedIds);
  const claim = useAchievementStore((s) => s.claim);
  const pushToast = useUIStore((s) => s.pushToast);

  const ctx: AchievementContext = {
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
    heaviestCatch,
  };

  const claimedCount = ACHIEVEMENTS.filter((a) => claimedIds.includes(a.id)).length;

  const handleClaim = (id: string, reward: number) => {
    const success = claim(id, ctx);
    if (success) {
      playCoin();
      pushToast(`Achievement claimed: +$${reward}!`, 'success');
    }
  };

  return (
    <div className="achievements-panel">
      <p className="build-intro">
        Long-term milestones for your pond empire. Claim each one for a one-time <strong>coin</strong> bonus.
      </p>

      <div className="inventory-stats">
        <div className="hud-pill">
          🏆 Unlocked: {claimedCount}/{ACHIEVEMENTS.length}
        </div>
      </div>

      <div className="quest-list">
        {ACHIEVEMENTS.map((a) => {
          const progress = Math.min(a.target, a.progress(ctx));
          const done = progress >= a.target;
          const claimed = claimedIds.includes(a.id);
          const pct = Math.min(100, Math.round((progress / a.target) * 100));

          return (
            <div key={a.id} className={`quest-card ${claimed ? 'claimed' : ''}`}>
              <div className="quest-icon">{a.icon}</div>
              <div className="quest-info">
                <p className="item-name">{a.name}</p>
                <p className="item-desc">{a.description}</p>
                <div className="timer-bar quest-progress-bar">
                  <div className="timer-bar-fill quest-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="item-desc">
                  {progress.toLocaleString()}/{a.target.toLocaleString()} · Reward: 💰 ${a.reward.toLocaleString()}
                </p>
              </div>
              <div className="quest-action">
                {claimed ? (
                  <span className="owned-badge">Claimed</span>
                ) : (
                  <button className="buy-button" disabled={!done} onClick={() => handleClaim(a.id, a.reward)}>
                    Claim
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
