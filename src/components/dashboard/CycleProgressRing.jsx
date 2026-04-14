import { PHASE_INFO } from '../../utils/cycleCalculations';
import './CycleProgressRing.css';

export default function CycleProgressRing({ day, total, phase }) {
  const progress = Math.min(day / total, 1);
  const radius = 56;
  const stroke = 7;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;
  const phaseInfo = PHASE_INFO[phase];

  return (
    <div className="progress-ring-wrapper">
      <svg
        className="progress-ring-svg"
        height={radius * 2}
        width={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      >
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--pink-400)" />
            <stop offset="100%" stopColor="var(--pink-600)" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          className="progress-ring-bg"
          stroke="rgba(255,255,255,0.3)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress circle */}
        <circle
          className="progress-ring-progress"
          stroke="url(#ringGradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      <div className="progress-ring-center">
        <span className="progress-ring-label">Day</span>
        <span className="progress-ring-day">{day}</span>
        <span className="progress-ring-divider">of {total} days</span>
      </div>

      <div className="progress-ring-emoji">{phaseInfo?.emoji}</div>
    </div>
  );
}
