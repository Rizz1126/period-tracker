import { useCycle } from '../../context/CycleContext';
import { Clock } from 'lucide-react';
import './SymptomQuickEntry.css';

const flowOptions = [
  { value: 'light', emoji: '💧', label: 'Light' },
  { value: 'medium', emoji: '💧💧', label: 'Medium' },
  { value: 'heavy', emoji: '💧💧💧', label: 'Heavy' },
];

const painOptions = [
  { value: 'none', emoji: '😊', label: 'None' },
  { value: 'mild', emoji: '😐', label: 'Mild' },
  { value: 'intense', emoji: '😣', label: 'Intense' },
];

const moodOptions = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'energetic', emoji: '⚡', label: 'Energetic' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'angry', emoji: '😤', label: 'Angry' },
];

const dischargeOptions = [
  { value: 'none', emoji: '⚪', label: 'None' },
  { value: 'sticky', emoji: '🫧', label: 'Sticky' },
  { value: 'creamy', emoji: '🥛', label: 'Creamy' },
  { value: 'watery', emoji: '💧', label: 'Watery' },
  { value: 'eggwhite', emoji: '✨', label: 'Egg White' },
];

function OptionGroup({ title, options, value, onChange, category }) {
  return (
    <div className="symptom-group" id={`symptom-${category}`}>
      <h4 className="symptom-group-title">{title}</h4>
      <div className="symptom-options">
        {options.map(opt => (
          <button
            key={opt.value}
            className={`symptom-option ${value === opt.value ? 'selected' : ''}`}
            onClick={() => onChange(category, opt.value === value ? null : opt.value)}
          >
            <span className="symptom-option-emoji">{opt.emoji}</span>
            <span className="symptom-option-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SymptomQuickEntry() {
  const { todayLog, todayKey, dispatch } = useCycle();

  const handleChange = (category, value) => {
    dispatch({
      type: 'UPDATE_DAILY_LOG',
      payload: {
        date: todayKey,
        data: { [category]: value },
      },
    });
  };

  return (
    <section className="symptom-entry card-flat animate-fade-in-up stagger-2" id="symptom-quick-entry">
      <div className="symptom-entry-header">
        <h3 className="text-h2">Log Today</h3>
        <div className="symptom-time-badge">
          <Clock size={14} />
          <span>Today</span>
        </div>
      </div>

      <div className="symptom-scroll">
        <OptionGroup title="Flow" options={flowOptions} value={todayLog.flow} onChange={handleChange} category="flow" />
        <OptionGroup title="Pain" options={painOptions} value={todayLog.pain} onChange={handleChange} category="pain" />
        <OptionGroup title="Mood" options={moodOptions} value={todayLog.mood} onChange={handleChange} category="mood" />
        <OptionGroup title="Discharge" options={dischargeOptions} value={todayLog.discharge} onChange={handleChange} category="discharge" />
      </div>
    </section>
  );
}
