import { useEffect } from 'react';
import { useQuestStore } from '../../store/questStore';
import { useUIStore } from '../../store/uiStore';
import { playCoin } from '../../utils/audio';

export default function QuestsPanel() {
  const quests = useQuestStore((s) => s.quests);
  const ensureDaily = useQuestStore((s) => s.ensureDaily);
  const claimReward = useQuestStore((s) => s.claimReward);
  const pushToast = useUIStore((s) => s.pushToast);

  useEffect(() => {
    ensureDaily();
  }, [ensureDaily]);

  const handleClaim = (id: string, reward: number) => {
    const success = claimReward(id);
    if (success) {
      playCoin();
      pushToast(`Claimed reward: +$${reward}!`, 'success');
    }
  };

  const allClaimed = quests.length > 0 && quests.every((q) => q.claimed);

  return (
    <div className="quests-panel">
      <p className="build-intro">
        Fresh quests every day — complete objectives to earn bonus <strong>coins</strong>. Come back tomorrow for a new set!
      </p>

      {allClaimed && <div className="empty-state">All of today's quests are complete. Check back tomorrow!</div>}

      <div className="quest-list">
        {quests.map((q) => {
          const done = q.progress >= q.target;
          const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
          return (
            <div key={q.id} className={`quest-card ${q.claimed ? 'claimed' : ''}`}>
              <div className="quest-icon">{q.icon}</div>
              <div className="quest-info">
                <p className="item-name">{q.description}</p>
                <div className="timer-bar quest-progress-bar">
                  <div className="timer-bar-fill quest-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="item-desc">
                  {q.type === 'catchValue' ? `$${q.progress}/$${q.target}` : `${q.progress}/${q.target}`} · Reward: 💰 $
                  {q.reward.toLocaleString()}
                </p>
              </div>
              <div className="quest-action">
                {q.claimed ? (
                  <span className="owned-badge">Claimed</span>
                ) : (
                  <button className="buy-button" disabled={!done} onClick={() => handleClaim(q.id, q.reward)}>
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
