import { useCycle } from '../../context/CycleContext';
import { predictCycleLength } from '../../utils/cycleCalculations';
import { BarChart3 } from 'lucide-react';
import './WidgetCards.css';

export default function CycleConsistency() {
  const { cycleLengths, predictedLength, cycleDay } = useCycle();

  const lastCycleLength = cycleLengths.length > 0 ? cycleLengths[cycleLengths.length - 1] : 28;
  const avgLength = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : 28;

  const maxDisplay = Math.max(lastCycleLength, avgLength, predictedLength) + 4;

  const diff = lastCycleLength - avgLength;
  const diffText = diff === 0
    ? 'Right on average!'
    : diff > 0
      ? `${diff} day${diff > 1 ? 's' : ''} longer than average`
      : `${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''} shorter than average`;

  return (
    <div className="widget-card card animate-fade-in-up stagger-6" id="cycle-consistency">
      <div className="widget-header">
        <div className="widget-icon" style={{ background: 'linear-gradient(135deg, #42A5F5, #1E88E5)' }}>
          <BarChart3 size={18} color="white" />
        </div>
        <div>
          <h3 className="widget-title">Cycle Consistency</h3>
          <p className="widget-subtitle">{diffText}</p>
        </div>
      </div>

      <div className="consistency-bars">
        <div className="consistency-row">
          <span className="consistency-label">Current</span>
          <div className="consistency-track">
            <div
              className="consistency-fill current"
              style={{ width: `${(cycleDay / maxDisplay) * 100}%` }}
            ></div>
          </div>
          <span className="consistency-value">Day {cycleDay}</span>
        </div>

        <div className="consistency-row">
          <span className="consistency-label">Last cycle</span>
          <div className="consistency-track">
            <div
              className="consistency-fill last"
              style={{ width: `${(lastCycleLength / maxDisplay) * 100}%` }}
            ></div>
          </div>
          <span className="consistency-value">{lastCycleLength}d</span>
        </div>

        <div className="consistency-row">
          <span className="consistency-label">Average</span>
          <div className="consistency-track">
            <div
              className="consistency-fill average"
              style={{ width: `${(avgLength / maxDisplay) * 100}%` }}
            ></div>
          </div>
          <span className="consistency-value">{avgLength}d</span>
        </div>

        <div className="consistency-row">
          <span className="consistency-label">Predicted</span>
          <div className="consistency-track">
            <div
              className="consistency-fill predicted"
              style={{ width: `${(predictedLength / maxDisplay) * 100}%` }}
            ></div>
          </div>
          <span className="consistency-value">{predictedLength}d</span>
        </div>
      </div>
    </div>
  );
}
