import { getScoreLabel, getScoreColor } from '../../utils/healthScore';
import './HealthScoreBadge.css';

export default function HealthScoreBadge({ score }) {
  const label = getScoreLabel(score);
  const color = getScoreColor(score);
  const percentage = (score / 10) * 100;

  return (
    <div className="health-score-badge" id="health-score">
      <div className="health-score-label">Health Score</div>
      <div className="health-score-bar-track">
        <div
          className="health-score-bar-fill"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
      <div className="health-score-value">
        <span className="health-score-number" style={{ color }}>{score}</span>
        <span className="health-score-max">/10</span>
        <span className="health-score-text" style={{ color }}>• {label}</span>
      </div>
    </div>
  );
}
