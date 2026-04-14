import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCycle } from '../../context/CycleContext';
import { toDateString } from '../../utils/cycleCalculations';
import { ChevronLeft, ChevronRight, Check, Pencil } from 'lucide-react';

const moodOptions = [
  'Happy', 'Excited', 'Content', 'Calm', 'Sad', 'Angry', 'Depressed', 'Frustrated', 'Anxious', 'Impatient', 'Mood Swings', 'Energetic',
];

const symptomOptions = [
  'Acne', 'Backaches', 'Bloating', 'Breast Tenderness', 'Constipation', 'Cramps', 'Cravings - Salty', 'Cravings - Sweet', 'Dizziness', 'Fatigue', 'Headache', 'Indigestion', 'Insomnia', 'Nausea',
];

const affectionOptions = ['Physical Touch', 'Words of Affirmation', 'Quality Time', 'Space Needed'];
const conflictOptions = ['Avoid Conflict', 'Neutral', 'Easily Triggered'];
const flowOptions = ['Light', 'Medium', 'Heavy'];
const painOptions = ['Mild', 'Medium', 'Severe'];
const sleepOptions = Array.from({ length: 21 }, (_, index) => (2 + index * 0.5).toFixed(1));
const waterOptions = Array.from({ length: 16 }, (_, index) => ((index + 1) * 0.25).toFixed(2).replace(/0$/, '').replace(/\.$/, ''));

const steps = [
  { id: 'flow-pain', label: 'Period & Pain', emoji: '🩸' },
  { id: 'mood-sleep', label: 'Mood & Sleep', emoji: '😊' },
  { id: 'water-bbt', label: 'Water & Body Temp', emoji: '💧' },
  { id: 'symptoms', label: 'Symptoms', emoji: '🏥' },
  { id: 'energy-stress', label: 'Energy & Stress', emoji: '⚡' },
  { id: 'emotions', label: 'Emotions', emoji: '💭' },
  { id: 'relationship', label: 'Relationship', emoji: '💕' },
  { id: 'meds', label: 'Meds & Supplements', emoji: '💊' },
];

const stepLabels = {
  flow: 'Flow', pain: 'Pain', mood: 'Mood', sleep: 'Sleep', water: 'Water (L)',
  bbt: 'Body Temp', symptoms: 'Symptoms', energyLevel: 'Energy', stressLevel: 'Stress',
  emotionalSensitivity: 'Emotional Sensitivity', affectionNeed: 'What I Need',
  conflictSensitivity: 'Conflict Mood', medications: 'Medications',
};

export default function DailyLogSection() {
  const { dailyLogs, todayKey, dispatch, activeCycle, lastCycle } = useCycle();
  const navigate = useNavigate();
  const yesterdayKey = toDateString(new Date(Date.now() - 1000 * 60 * 60 * 24));
  const yesterdayLog = dailyLogs[yesterdayKey] || {};
  const todayLog = dailyLogs[todayKey] || {};
  const [currentStep, setCurrentStep] = useState(0);
  const [skipNoChange, setSkipNoChange] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editStepIdx, setEditStepIdx] = useState(null);
  const [otherMood, setOtherMood] = useState('');
  const [otherAffection, setOtherAffection] = useState('');

  const [formData, setFormData] = useState({
    flow: todayLog.flow || '',
    pain: todayLog.pain || '',
    mood: Array.isArray(todayLog.mood) ? todayLog.mood : (todayLog.mood ? [todayLog.mood] : []),
    sleep: todayLog.sleep || '',
    water: todayLog.water || '',
    symptoms: todayLog.symptoms || [],
    energyLevel: todayLog.energyLevel || '',
    stressLevel: todayLog.stressLevel || '',
    emotionalSensitivity: todayLog.emotionalSensitivity || '',
    affectionNeed: todayLog.affectionNeed || '',
    conflictSensitivity: todayLog.conflictSensitivity || '',
    sexualDrive: todayLog.sexualDrive || '',
    sexualSatisfaction: todayLog.sexualSatisfaction || '',
    bbt: todayLog.bbt || '',
    medications: todayLog.medications || [],
  });

  // Check if today has been logged already
  const hasExistingLog = Boolean(todayLog && (todayLog.flow || todayLog.mood || todayLog.pain || todayLog.sleep));

  useEffect(() => {
    if (hasExistingLog && !submitted) setSubmitted(true);
  }, [hasExistingLog]);

  const previousValues = useMemo(() => ({
    ...yesterdayLog,
    flow: '',
    water: '',
  }), [yesterdayLog]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...todayLog,
      mood: Array.isArray(todayLog.mood) ? todayLog.mood : (todayLog.mood ? [todayLog.mood] : prev.mood),
      symptoms: todayLog.symptoms || prev.symptoms,
      medications: todayLog.medications || prev.medications,
    }));
  }, [todayLog]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMood = (mood) => {
    setFormData((prev) => {
      const list = prev.mood || [];
      const next = list.includes(mood) ? list.filter(m => m !== mood) : [...list, mood];
      return { ...prev, mood: next };
    });
  };

  const toggleArrayItem = (key, value) => {
    setFormData((prev) => {
      const list = prev[key] || [];
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...prev, [key]: next };
    });
  };

  const handleSkip = () => {
    dispatch({
      type: 'UPDATE_DAILY_LOG',
      payload: { date: todayKey, data: previousValues },
    });
    setSkipNoChange(true);
    setFormData((prev) => ({ ...prev, ...previousValues, flow: '', water: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Add other mood if filled
    let finalMood = [...formData.mood];
    if (otherMood.trim() && !finalMood.includes(otherMood.trim())) {
      finalMood.push(otherMood.trim());
    }

    // Add other affection if filled
    let finalAffection = formData.affectionNeed;
    if (otherAffection.trim() && formData.affectionNeed === 'Other') {
      finalAffection = otherAffection.trim();
    }

    dispatch({
      type: 'UPDATE_DAILY_LOG',
      payload: {
        date: todayKey,
        data: {
          ...formData,
          mood: finalMood,
          affectionNeed: finalAffection,
          symptoms: formData.symptoms.filter(Boolean),
          medications: formData.medications.filter(Boolean),
        },
      },
    });
    setSubmitted(true);
    setEditStepIdx(null);
    setCurrentStep(0);
    setSkipNoChange(false);

    // Auto-navigate to analysis after brief delay
    setTimeout(() => navigate('/analysis'), 400);
  };

  const handleEndPeriod = () => {
    if (!lastCycle) return;
    dispatch({ type: 'CLOSE_PERIOD', payload: { endDate: todayKey } });
  };

  const handleEditStep = (idx) => {
    setEditStepIdx(idx);
    setCurrentStep(idx);
    setSubmitted(false);
  };

  const handleSaveEdit = () => {
    let finalMood = [...formData.mood];
    if (otherMood.trim() && !finalMood.includes(otherMood.trim())) {
      finalMood.push(otherMood.trim());
    }
    let finalAffection = formData.affectionNeed;
    if (otherAffection.trim() && formData.affectionNeed === 'Other') {
      finalAffection = otherAffection.trim();
    }
    dispatch({
      type: 'UPDATE_DAILY_LOG',
      payload: {
        date: todayKey,
        data: {
          ...formData,
          mood: finalMood,
          affectionNeed: finalAffection,
          symptoms: formData.symptoms.filter(Boolean),
          medications: formData.medications.filter(Boolean),
        },
      },
    });
    setSubmitted(true);
    setEditStepIdx(null);
  };

  const currentStepData = steps[currentStep];

  const formatValue = (key, val) => {
    if (!val || (Array.isArray(val) && val.length === 0)) return '—';
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  };

  const renderStepContent = () => {
    const stepId = currentStepData.id;
    switch (stepId) {
      case 'flow-pain':
        return (
          <>
            <h3 className="step-title">Period flow</h3>
            <div className="option-grid">
              {flowOptions.map((flow) => (
                <button
                  key={flow}
                  type="button"
                  className={`option-btn ${formData.flow === flow.toLowerCase() ? 'selected' : ''}`}
                  onClick={() => handleChange('flow', flow.toLowerCase())}
                >
                  {flow}
                </button>
              ))}
            </div>
            <h3 className="step-title" style={{ marginTop: 'var(--space-lg)' }}>How's the pain?</h3>
            <div className="option-grid">
              {painOptions.map((pain) => (
                <button
                  key={pain}
                  type="button"
                  className={`option-btn ${formData.pain === pain.toLowerCase() ? 'selected' : ''}`}
                  onClick={() => handleChange('pain', pain.toLowerCase())}
                >
                  {pain}
                </button>
              ))}
            </div>
          </>
        );

      case 'mood-sleep':
        return (
          <>
            <h3 className="step-title">How's your mood? <span className="step-hint">(select multiple)</span></h3>
            <div className="option-grid mood-grid">
              {moodOptions.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  className={`option-btn ${formData.mood.includes(mood.toLowerCase()) ? 'selected' : ''}`}
                  onClick={() => toggleMood(mood.toLowerCase())}
                >
                  {mood}
                </button>
              ))}
              <button
                type="button"
                className={`option-btn other-btn ${otherMood ? 'selected' : ''}`}
                onClick={() => document.getElementById('other-mood-input')?.focus()}
              >
                + Other
              </button>
            </div>
            {true && (
              <input
                id="other-mood-input"
                className="input-field other-input"
                type="text"
                placeholder="Type your mood..."
                value={otherMood}
                onChange={(e) => setOtherMood(e.target.value)}
              />
            )}

            <h3 className="step-title" style={{ marginTop: 'var(--space-lg)' }}>How much sleep?</h3>
            <select className="input-field" value={formData.sleep} onChange={(e) => handleChange('sleep', e.target.value)}>
              <option value="">Pick one</option>
              {sleepOptions.map((sleep) => <option key={sleep} value={sleep}>{sleep}h</option>)}
            </select>
          </>
        );

      case 'water-bbt':
        return (
          <>
            <h3 className="step-title">Water intake (Liters)</h3>
            <select className="input-field" value={formData.water} onChange={(e) => handleChange('water', e.target.value)}>
              <option value="">Pick one</option>
              {waterOptions.map((w) => <option key={w} value={w}>{w} L</option>)}
            </select>

            <h3 className="step-title" style={{ marginTop: 'var(--space-lg)' }}>Body Temperature (BBT)</h3>
            <input className="input-field" type="number" step="0.05" placeholder="36.45°C" value={formData.bbt} onChange={(e) => handleChange('bbt', e.target.value)} />
          </>
        );

      case 'symptoms':
        return (
          <>
            <h3 className="step-title">Any symptoms today?</h3>
            <div className="checkbox-grid">
              {symptomOptions.map((symptom) => (
                <button
                  key={symptom}
                  type="button"
                  className={`pill ${formData.symptoms.includes(symptom) ? 'selected' : ''}`}
                  onClick={() => toggleArrayItem('symptoms', symptom)}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </>
        );

      case 'energy-stress':
        return (
          <>
            <h3 className="step-title">Your energy level</h3>
            <div className="option-grid energy-grid">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`option-btn energy-btn ${formData.energyLevel === String(value) ? 'selected' : ''}`}
                  onClick={() => handleChange('energyLevel', String(value))}
                >
                  <span className="energy-num">{value}</span>
                  <span className="energy-label">{['Very Low', 'Low', 'Normal', 'High', 'Very High'][value - 1]}</span>
                </button>
              ))}
            </div>

            <h3 className="step-title" style={{ marginTop: 'var(--space-lg)' }}>Stress level</h3>
            <div className="option-grid energy-grid">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`option-btn energy-btn ${formData.stressLevel === String(value) ? 'selected' : ''}`}
                  onClick={() => handleChange('stressLevel', String(value))}
                >
                  <span className="energy-num">{value}</span>
                  <span className="energy-label">{['Relaxed', 'Calm', 'Moderate', 'Stressed', 'Very Stressed'][value - 1]}</span>
                </button>
              ))}
            </div>
          </>
        );

      case 'emotions':
        return (
          <>
            <h3 className="step-title">Emotional sensitivity</h3>
            <div className="option-grid">
              {['Low', 'Medium', 'High'].map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`option-btn ${formData.emotionalSensitivity === opt.toLowerCase() ? 'selected' : ''}`}
                  onClick={() => handleChange('emotionalSensitivity', opt.toLowerCase())}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        );

      case 'relationship':
        return (
          <>
            <h3 className="step-title">What do you need?</h3>
            <div className="option-grid">
              {affectionOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`option-btn ${formData.affectionNeed === option ? 'selected' : ''}`}
                  onClick={() => handleChange('affectionNeed', option)}
                >
                  {option}
                </button>
              ))}
              <button
                type="button"
                className={`option-btn other-btn ${formData.affectionNeed === 'Other' ? 'selected' : ''}`}
                onClick={() => handleChange('affectionNeed', 'Other')}
              >
                + Other
              </button>
            </div>
            {formData.affectionNeed === 'Other' && (
              <input
                className="input-field other-input"
                type="text"
                placeholder="What do you need?"
                value={otherAffection}
                onChange={(e) => setOtherAffection(e.target.value)}
              />
            )}

            <h3 className="step-title" style={{ marginTop: 'var(--space-lg)' }}>Conflict mood</h3>
            <div className="option-grid">
              {conflictOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`option-btn ${formData.conflictSensitivity === option ? 'selected' : ''}`}
                  onClick={() => handleChange('conflictSensitivity', option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        );

      case 'meds':
        return (
          <>
            <h3 className="step-title">Any meds or supplements?</h3>
            <div className="checkbox-grid">
              {['Painkiller', 'Birth Control', 'Iron', 'Magnesium'].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  className={`pill ${formData.medications.includes(pill) ? 'selected' : ''}`}
                  onClick={() => toggleArrayItem('medications', pill)}
                >
                  {pill}
                </button>
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!activeCycle) {
    return (
      <section className="daily-log-section card-flat animate-fade-in-up" id="daily-log-section">
        <div className="empty-log-state">
          <span className="empty-log-emoji">📝</span>
          <h2 className="text-h2">Daily Log</h2>
          <p className="text-body">Start your period to begin logging daily updates!</p>
        </div>
      </section>
    );
  }

  // Submitted state — show summary + edit buttons
  if (submitted && editStepIdx === null) {
    const logData = dailyLogs[todayKey] || formData;
    const filledFields = Object.entries(logData).filter(([key, val]) => {
      if (['sexualDrive', 'sexualSatisfaction'].includes(key)) return false;
      if (!val) return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    });

    return (
      <section className="daily-log-section card-flat animate-fade-in-up" id="daily-log-section">
        <div className="log-submitted-header">
          <div className="submitted-badge">
            <Check size={16} />
            <span>Logged for today</span>
          </div>
          <h2 className="text-h2">Today's Check-In</h2>
        </div>
        <div className="log-summary-grid">
          {filledFields.map(([key, val]) => {
            const label = stepLabels[key] || key;
            return (
              <div key={key} className="log-summary-item">
                <span className="log-summary-label">{label}</span>
                <span className="log-summary-value">{formatValue(key, val)}</span>
              </div>
            );
          })}
        </div>
        <p className="edit-here-label">✏️ Edit here</p>
        <div className="log-edit-actions">
          {steps.map((step, idx) => (
            <button key={step.id} className="edit-step-btn" type="button" onClick={() => handleEditStep(idx)}>
              <Pencil size={12} />
              <span>{step.emoji} {step.label}</span>
            </button>
          ))}
        </div>
        {activeCycle && (
          <div className="end-period-block">
            <p className="text-body">Done with your period?</p>
            <button className="btn btn-secondary" type="button" onClick={handleEndPeriod}>End Period</button>
          </div>
        )}
      </section>
    );
  }

  if (skipNoChange && currentStep === 0) {
    return (
      <section className="daily-log-section card-flat animate-fade-in-up" id="daily-log-section">
        <h2 className="text-h2">Daily Log</h2>
        <p className="text-caption">No changes? We saved yesterday's info for today.</p>
        <button className="btn btn-primary" type="button" onClick={() => setSkipNoChange(false)}>Make changes</button>
        <div style={{ height: 'var(--space-md)' }} />
      </section>
    );
  }

  // Edit mode for specific step
  const isEditing = editStepIdx !== null;

  return (
    <section className="daily-log-section card-flat animate-fade-in-up" id="daily-log-section">
      <div className="log-header">
        <div>
          <h2 className="text-h2">{isEditing ? `Edit: ${steps[currentStep].emoji} ${steps[currentStep].label}` : 'Daily Check-In'}</h2>
          {!isEditing && (
            <p className="text-caption">Step {currentStep + 1} of {steps.length}</p>
          )}
        </div>
        {!isEditing && (
          <div className="step-progress">
            {steps.map((_, i) => (
              <span key={i} className={`step-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}`} />
            ))}
          </div>
        )}
      </div>

      <form className="daily-log-form" onSubmit={isEditing ? (e) => { e.preventDefault(); handleSaveEdit(); } : handleSubmit}>
        <div className="step-content">
          {renderStepContent()}
        </div>

        {isEditing ? (
          <div className="step-navigation">
            <button type="button" className="btn btn-secondary" onClick={() => { setEditStepIdx(null); setSubmitted(true); }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Save Changes
            </button>
          </div>
        ) : (
          <div className="step-navigation">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            {currentStep === steps.length - 1 ? (
              <button type="submit" className="btn btn-primary submit-btn">
                <Check size={18} />
                Submit Log
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              >
                Next
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        )}

        {!isEditing && currentStep === 0 && (
          <button
            type="button"
            className="btn btn-ghost skip-btn"
            onClick={handleSkip}
          >
            No changes from yesterday
          </button>
        )}
      </form>

      {!isEditing && activeCycle && (
        <div className="end-period-block">
          <p className="text-body">Done with your period?</p>
          <button className="btn btn-secondary" type="button" onClick={handleEndPeriod}>End Period</button>
        </div>
      )}
    </section>
  );
}
