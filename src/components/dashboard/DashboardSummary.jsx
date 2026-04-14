import { useCycle } from '../../context/CycleContext';
import { PHASE_INFO, formatDate } from '../../utils/cycleCalculations';
import CycleProgressRing from './CycleProgressRing';

export default function DashboardSummary() {
  const {
    currentPhase,
    cycleDay,
    predictedLength,
    daysUntilPeriod,
    userName,
    activeCycle,
    lastCycle,
  } = useCycle();

  const phaseInfo = PHASE_INFO[currentPhase];
  const greeting = getGreeting();
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Determine period timing status
  const NORMAL_MIN = 21;
  const NORMAL_MAX = 35;
  let periodTimingStatus = null;
  if (lastCycle && activeCycle) {
    const cycleStart = new Date(lastCycle.startDate);
    const daysSinceStart = cycleDay;
    if (daysSinceStart > NORMAL_MAX) {
      periodTimingStatus = { type: 'late', label: 'Your period is late', color: 'var(--warning)', emoji: '⚠️' };
    } else if (predictedLength < NORMAL_MIN) {
      periodTimingStatus = { type: 'early', label: 'Your cycle is shorter than normal', color: 'var(--phase-menstruation)', emoji: '🔴' };
    }
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  return (
    <section className="welcome-section animate-fade-in-up" id="dashboard-summary">
      <div className="welcome-header">
        <div className="welcome-text">
          <p className="welcome-greeting">{greeting}, <strong>{userName || 'Babe'}</strong> 💕</p>
          <h1 className="welcome-title">How are you feeling today?</h1>
          <p className="welcome-subtitle">Track your body, understand your patterns.</p>
          <div className="tracking-month-badge">
            <span>📅</span>
            <span>Tracking: <strong>{currentMonth}</strong></span>
          </div>
        </div>
        {activeCycle && (
          <div className="welcome-ring">
            <CycleProgressRing day={cycleDay} total={predictedLength} phase={currentPhase} />
          </div>
        )}
      </div>

      {/* Period Timing Alert */}
      {periodTimingStatus && (
        <div className="period-timing-alert" style={{ '--alert-color': periodTimingStatus.color }}>
          <span>{periodTimingStatus.emoji}</span>
          <span>{periodTimingStatus.label}</span>
        </div>
      )}

      {activeCycle && (
        <div className="quick-stats">
          <div className="quick-stat-card">
            <span className="quick-stat-emoji">{phaseInfo?.emoji}</span>
            <div>
              <p className="quick-stat-label">Current Phase</p>
              <p className="quick-stat-value">{phaseInfo?.label}</p>
            </div>
          </div>
          <div className="quick-stat-card">
            <span className="quick-stat-emoji">📅</span>
            <div>
              <p className="quick-stat-label">Cycle Day</p>
              <p className="quick-stat-value">{cycleDay} of {predictedLength}</p>
            </div>
          </div>
          <div className="quick-stat-card">
            <span className="quick-stat-emoji">⏳</span>
            <div>
              <p className="quick-stat-label">Next Period</p>
              <p className="quick-stat-value">{daysUntilPeriod} days</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
