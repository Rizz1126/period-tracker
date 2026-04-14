import { useCycle } from '../../context/CycleContext';
import { phaseInsights, symptomInsights } from '../../data/insights';
import { Lightbulb } from 'lucide-react';
import './WidgetCards.css';

export default function InsightCards() {
  const { currentPhase, todayLog } = useCycle();

  // Get phase-specific insights (pick 2)
  const phaseCards = (phaseInsights[currentPhase] || []).slice(0, 2);

  // Get symptom-triggered insights
  const symptomCards = [];
  if (todayLog.pain === 'intense') symptomCards.push(symptomInsights.pain_intense);
  if (todayLog.mood === 'sad') symptomCards.push(symptomInsights.mood_sad);
  if (todayLog.mood === 'anxious') symptomCards.push(symptomInsights.mood_anxious);
  if (todayLog.sleep === 'poor') symptomCards.push(symptomInsights.sleep_poor);
  if (todayLog.stress === 'high') symptomCards.push(symptomInsights.stress_high);

  const allInsights = [...symptomCards, ...phaseCards].slice(0, 3);

  if (allInsights.length === 0) return null;

  return (
    <section className="insights-section" id="insights-section">
      <div className="section-header">
        <Lightbulb size={20} className="section-icon" />
        <h3 className="text-h2">What&apos;s Happening</h3>
      </div>
      <div className="insights-grid">
        {allInsights.map((insight, i) => (
          <div key={i} className="insight-card card-flat animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="insight-icon">{insight.icon}</div>
            <div className="insight-content">
              <h4 className="insight-title">{insight.title}</h4>
              <p className="insight-body">{insight.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
