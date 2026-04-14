import { useCycle } from '../../context/CycleContext';
import { phaseActivities } from '../../data/activities';
import { Dumbbell } from 'lucide-react';
import './WidgetCards.css';

export default function ActivityGuide() {
  const { currentPhase } = useCycle();
  const guide = phaseActivities[currentPhase];

  if (!guide) return null;

  return (
    <div className="widget-card card animate-fade-in-up stagger-5" id="activity-guide">
      <div className="widget-header">
        <div className="widget-icon" style={{ background: 'linear-gradient(135deg, #66BB6A, #43A047)' }}>
          <Dumbbell size={18} color="white" />
        </div>
        <div>
          <h3 className="widget-title">{guide.title}</h3>
          <p className="widget-subtitle">{guide.description}</p>
        </div>
      </div>

      <div className="activity-list">
        {guide.activities.map((act, i) => (
          <div key={i} className="activity-item">
            <span className="activity-emoji">{act.emoji}</span>
            <div className="activity-info">
              <span className="activity-name">{act.name}</span>
              <span className="activity-duration">{act.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
