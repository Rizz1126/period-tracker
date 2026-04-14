import { useCycle } from '../../context/CycleContext';
import { useTheme } from '../../context/ThemeContext';
import { PHASE_INFO } from '../../utils/cycleCalculations';
import CycleProgressRing from './CycleProgressRing';
import HealthScoreBadge from './HealthScoreBadge';
import { Moon, Sun, Eye, EyeOff } from 'lucide-react';
import './StateOfBeingHeader.css';

export default function StateOfBeingHeader() {
  const { cycleDay, predictedLength, currentPhase, predictiveText, healthScore, fertility } = useCycle();
  const { theme, toggleTheme, privacyMode, togglePrivacy } = useTheme();
  const phase = PHASE_INFO[currentPhase];

  return (
    <header className={`state-header phase-${currentPhase}`} id="state-of-being-header">
      {/* Decorative elements */}
      <div className="header-deco header-deco-1">✿</div>
      <div className="header-deco header-deco-2">❀</div>
      <div className="header-deco header-deco-3">♡</div>

      {/* Mobile-only toggles */}
      <div className="header-actions">
        <button className="header-action-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="header-action-btn" onClick={togglePrivacy} title="Toggle privacy">
          {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="header-content">
        <CycleProgressRing
          day={cycleDay}
          total={predictedLength}
          phase={currentPhase}
        />

        <div className="header-info">
          <div className="phase-badge" style={{ '--phase-color': phase.color }}>
            <span className="phase-emoji">{phase.emoji}</span>
            <span>{privacyMode ? 'Current Phase' : phase.label}</span>
          </div>

          <p className="predictive-text">
            {privacyMode ? `Day ${cycleDay} of ${predictedLength}` : predictiveText}
          </p>

          {fertility >= 70 && !privacyMode && (
            <div className="fertility-indicator">
              <span className="fertility-dot"></span>
              High fertility window
            </div>
          )}
        </div>
      </div>

      <HealthScoreBadge score={healthScore} />
    </header>
  );
}
