import { useMemo } from 'react';
import { useCycle } from '../context/CycleContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Label, ReferenceLine,
} from 'recharts';
import { TrendingUp, Activity, Calendar, Download, Award, Droplets, Moon, Heart, Zap, Brain, AlertTriangle, Clock } from 'lucide-react';
import { exportToExcel } from '../utils/exportToExcel';
import './AnalysisPage.css';

/* ============================
   Wellness Scoring Engine
   ============================ */
function calculateWellnessScore(log) {
  if (!log || Object.keys(log).length === 0) return null;

  let total = 0;
  let maxPossible = 0;

  // Pain (30%)
  const painScores = { none: 100, mild: 70, medium: 40, severe: 10 };
  if (log.pain) { total += (painScores[log.pain] ?? 50) * 0.30; maxPossible += 100 * 0.30; }

  // Sleep (20%)
  const sleep = parseFloat(log.sleep);
  if (sleep) {
    let sleepScore = 60;
    if (sleep >= 7 && sleep <= 9) sleepScore = 100;
    else if (sleep >= 6) sleepScore = 70;
    else if (sleep < 6) sleepScore = 40;
    else if (sleep > 10) sleepScore = 60;
    total += sleepScore * 0.20;
    maxPossible += 100 * 0.20;
  }

  // Water (15%)
  const water = parseFloat(log.water);
  if (water) {
    let waterScore = 50;
    if (water >= 2.0) waterScore = 100;
    else if (water >= 1.5) waterScore = 80;
    else if (water >= 1.0) waterScore = 50;
    else waterScore = 20;
    total += waterScore * 0.15;
    maxPossible += 100 * 0.15;
  }

  // Stress (15%)
  const stress = parseInt(log.stressLevel, 10);
  if (stress) {
    const stressScores = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20 };
    total += (stressScores[stress] ?? 60) * 0.15;
    maxPossible += 100 * 0.15;
  }

  // Energy (10%)
  const energy = parseInt(log.energyLevel, 10);
  if (energy) {
    const energyScores = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
    total += (energyScores[energy] ?? 60) * 0.10;
    maxPossible += 100 * 0.10;
  }

  // Mood (10%)
  const moods = Array.isArray(log.mood) ? log.mood : (log.mood ? [log.mood] : []);
  if (moods.length > 0) {
    const positiveMoods = ['happy', 'excited', 'content', 'calm', 'energetic'];
    const negativeMoods = ['sad', 'angry', 'depressed', 'frustrated', 'anxious'];
    const posCount = moods.filter(m => positiveMoods.includes(m)).length;
    const negCount = moods.filter(m => negativeMoods.includes(m)).length;
    let moodScore = 60;
    if (posCount > negCount) moodScore = 100;
    else if (negCount > posCount) moodScore = 30;
    total += moodScore * 0.10;
    maxPossible += 100 * 0.10;
  }

  if (maxPossible === 0) return null;
  return Math.round((total / maxPossible) * 100);
}

function getScoreColor(score) {
  if (score >= 80) return 'var(--success)';
  if (score >= 60) return 'var(--warning)';
  return 'var(--error)';
}

function getScoreLabel(score) {
  if (score >= 80) return 'Great';
  if (score >= 60) return 'Okay';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
}

const moodLabels = {
  happy: '😊 Happy', excited: '🤩 Excited', content: '😌 Content', calm: '😇 Calm',
  sad: '😢 Sad', angry: '😤 Angry', depressed: '😞 Depressed', frustrated: '😣 Frustrated',
  anxious: '😰 Anxious', impatient: '😤 Impatient', 'mood swings': '🎭 Mood Swings', energetic: '⚡ Energetic',
};

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NORMAL_CYCLE_MIN = 21;
const NORMAL_CYCLE_MAX = 35;

/* ============================
   Cycle Summary Helper
   ============================ */
function buildCycleSummary(cycle, dailyLogs) {
  if (!cycle || !cycle.startDate) return null;
  const start = new Date(cycle.startDate);
  const endDate = cycle.endDate ? new Date(cycle.endDate) : null;
  const days = cycle.length || (endDate ? Math.floor((endDate - start) / 86400000) + 1 : null);

  // Gather logs for this cycle
  const logs = [];
  if (days) {
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      if (dailyLogs[key]) logs.push(dailyLogs[key]);
    }
  }

  // Aggregate
  const moods = {};
  const symptoms = {};
  let totalSleep = 0, sleepCount = 0;
  let totalWater = 0, waterCount = 0;
  let totalEnergy = 0, energyCount = 0;
  let totalStress = 0, stressCount = 0;
  let worstPain = 'none';
  const painRank = { none: 0, mild: 1, medium: 2, severe: 3 };

  logs.forEach(log => {
    const m = Array.isArray(log.mood) ? log.mood : (log.mood ? [log.mood] : []);
    m.forEach(mood => { moods[mood] = (moods[mood] || 0) + 1; });
    (log.symptoms || []).forEach(s => { symptoms[s] = (symptoms[s] || 0) + 1; });
    if (log.sleep) { totalSleep += parseFloat(log.sleep); sleepCount++; }
    if (log.water) { totalWater += parseFloat(log.water); waterCount++; }
    if (log.energyLevel) { totalEnergy += parseInt(log.energyLevel); energyCount++; }
    if (log.stressLevel) { totalStress += parseInt(log.stressLevel); stressCount++; }
    if (log.pain && painRank[log.pain] > painRank[worstPain]) worstPain = log.pain;
  });

  const topMoods = Object.entries(moods).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m);
  const topSymptoms = Object.entries(symptoms).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s]) => s);

  // Period timing status
  let timingStatus = null;
  if (days) {
    if (days < NORMAL_CYCLE_MIN) timingStatus = { label: 'Shorter than normal', type: 'early', emoji: '🔴' };
    else if (days > NORMAL_CYCLE_MAX) timingStatus = { label: 'Longer than normal', type: 'late', emoji: '⚠️' };
    else timingStatus = { label: 'Normal range', type: 'normal', emoji: '✅' };
  }

  return {
    startMonth: `${MONTH_SHORT[start.getMonth()]} ${start.getFullYear()}`,
    startDate: cycle.startDate,
    endDate: cycle.endDate,
    length: days,
    logsCount: logs.length,
    avgSleep: sleepCount ? (totalSleep / sleepCount).toFixed(1) : null,
    avgWater: waterCount ? (totalWater / waterCount).toFixed(2) : null,
    avgEnergy: energyCount ? (totalEnergy / energyCount).toFixed(1) : null,
    avgStress: stressCount ? (totalStress / stressCount).toFixed(1) : null,
    worstPain,
    topMoods,
    topSymptoms,
    timingStatus,
  };
}

export default function AnalysisPage() {
  const { cycles, cycleLengths, predictedLength, bbtData, dailyLogs, todayKey, settings, completedCycles, lastCycle, activeCycle } = useCycle();

  const todayLog = dailyLogs[todayKey] || {};
  const wellnessScore = calculateWellnessScore(todayLog);

  // Cycle length history chart data — use month instead of "Cycle 1, 2, 3"
  const cycleLengthData = cycles.map((c) => {
    const d = new Date(c.startDate);
    return {
      month: `${MONTH_SHORT[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`,
      length: c.length,
      startDate: c.startDate,
    };
  });

  // BBT trend (renamed from BBT to Body Temperature)
  const bbtTrend = bbtData.slice(-30).map(b => ({
    date: b.date.slice(5),
    temp: b.temp,
  }));

  // Mood distribution from logs
  const moodCounts = {};
  Object.values(dailyLogs).forEach(log => {
    const moods = Array.isArray(log.mood) ? log.mood : (log.mood ? [log.mood] : []);
    moods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
  });
  const moodData = Object.entries(moodCounts)
    .map(([mood, count]) => ({ mood: moodLabels[mood] || mood, count }))
    .sort((a, b) => b.count - a.count);

  // Stats
  const avgLength = cycleLengths.length > 0
    ? (cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length).toFixed(1)
    : '—';
  const shortest = cycleLengths.length > 0 ? Math.min(...cycleLengths) : '—';
  const longest = cycleLengths.length > 0 ? Math.max(...cycleLengths) : '—';
  const totalCycles = cycles.length;

  // Period timing status for current cycle
  const currentCycleStatus = useMemo(() => {
    if (!lastCycle || !activeCycle) return null;
    const start = new Date(lastCycle.startDate);
    const now = new Date();
    const daysSince = Math.floor((now - start) / 86400000) + 1;
    if (daysSince > NORMAL_CYCLE_MAX) return { type: 'late', label: `Your period seems late (Day ${daysSince})`, emoji: '⚠️', color: 'var(--warning)' };
    if (predictedLength < NORMAL_CYCLE_MIN) return { type: 'early', label: `Cycle predicted shorter than normal (${predictedLength} days)`, emoji: '🔴', color: 'var(--error)' };
    return null;
  }, [lastCycle, activeCycle, predictedLength]);

  // Cycle summary for last completed cycle
  const lastCompletedCycle = completedCycles[completedCycles.length - 1];
  const cycleSummary = useMemo(() => buildCycleSummary(lastCompletedCycle, dailyLogs), [lastCompletedCycle, dailyLogs]);

  // Current (active) cycle summary
  const activeCycleSummary = useMemo(() => {
    if (!activeCycle || !lastCycle) return null;
    return buildCycleSummary(lastCycle, dailyLogs);
  }, [activeCycle, lastCycle, dailyLogs]);

  // Today's log summary fields
  const logSummaryFields = useMemo(() => {
    const log = todayLog;
    const fields = [];
    if (log.flow) fields.push({ icon: <Droplets size={16} />, label: 'Flow', value: log.flow, color: 'var(--phase-menstruation)' });
    if (log.pain) fields.push({ icon: <Activity size={16} />, label: 'Pain', value: log.pain, color: 'var(--error)' });
    const moods = Array.isArray(log.mood) ? log.mood : (log.mood ? [log.mood] : []);
    if (moods.length > 0) fields.push({ icon: <Heart size={16} />, label: 'Mood', value: moods.map(m => moodLabels[m] || m).join(', '), color: 'var(--pink-500)' });
    if (log.sleep) fields.push({ icon: <Moon size={16} />, label: 'Sleep', value: `${log.sleep}h`, color: 'var(--phase-luteal)' });
    if (log.water) fields.push({ icon: <Droplets size={16} />, label: 'Water', value: `${log.water} L`, color: 'var(--info)' });
    if (log.energyLevel) fields.push({ icon: <Zap size={16} />, label: 'Energy', value: `${log.energyLevel}/5`, color: 'var(--phase-follicular)' });
    if (log.stressLevel) fields.push({ icon: <Brain size={16} />, label: 'Stress', value: `${log.stressLevel}/5`, color: 'var(--warning)' });
    if (log.symptoms?.length) fields.push({ icon: <Activity size={16} />, label: 'Symptoms', value: log.symptoms.join(', '), color: 'var(--text-secondary)' });
    if (log.affectionNeed) fields.push({ icon: <Heart size={16} />, label: 'Need', value: log.affectionNeed, color: 'var(--pink-400)' });
    if (log.conflictSensitivity) fields.push({ icon: <Brain size={16} />, label: 'Conflict', value: log.conflictSensitivity, color: 'var(--phase-luteal)' });
    if (log.emotionalSensitivity) fields.push({ icon: <Heart size={16} />, label: 'Emotional', value: log.emotionalSensitivity, color: 'var(--pink-300)' });
    if (log.medications?.length) fields.push({ icon: <Activity size={16} />, label: 'Meds', value: log.medications.join(', '), color: 'var(--success)' });
    if (log.bbt) fields.push({ icon: <TrendingUp size={16} />, label: 'Body Temp', value: `${log.bbt}°C`, color: 'var(--phase-ovulation)' });
    return fields;
  }, [todayLog]);

  const handleExport = () => {
    exportToExcel(cycles, dailyLogs, settings);
  };

  const renderCycleSummaryCard = (summary, title, isActive = false) => {
    if (!summary) return null;
    return (
      <div className={`cycle-summary-card card-flat animate-fade-in-up ${isActive ? 'active-cycle' : ''}`}>
        <div className="cycle-summary-header">
          <div>
            <h3 className="section-title">
              <Clock size={18} />
              {title}
            </h3>
            <p className="widget-subtitle">{summary.startDate} → {summary.endDate || 'Ongoing'}</p>
          </div>
          {summary.timingStatus && (
            <span className={`timing-badge timing-${summary.timingStatus.type}`}>
              {summary.timingStatus.emoji} {summary.timingStatus.label}
            </span>
          )}
        </div>
        <div className="cycle-summary-stats">
          {summary.length && (
            <div className="cs-stat">
              <span className="cs-stat-value">{summary.length}</span>
              <span className="cs-stat-label">Days</span>
            </div>
          )}
          {summary.logsCount > 0 && (
            <div className="cs-stat">
              <span className="cs-stat-value">{summary.logsCount}</span>
              <span className="cs-stat-label">Logs</span>
            </div>
          )}
          {summary.avgSleep && (
            <div className="cs-stat">
              <span className="cs-stat-value">{summary.avgSleep}h</span>
              <span className="cs-stat-label">Avg Sleep</span>
            </div>
          )}
          {summary.avgWater && (
            <div className="cs-stat">
              <span className="cs-stat-value">{summary.avgWater}L</span>
              <span className="cs-stat-label">Avg Water</span>
            </div>
          )}
          {summary.avgEnergy && (
            <div className="cs-stat">
              <span className="cs-stat-value">{summary.avgEnergy}/5</span>
              <span className="cs-stat-label">Avg Energy</span>
            </div>
          )}
          {summary.avgStress && (
            <div className="cs-stat">
              <span className="cs-stat-value">{summary.avgStress}/5</span>
              <span className="cs-stat-label">Avg Stress</span>
            </div>
          )}
          {summary.worstPain !== 'none' && (
            <div className="cs-stat">
              <span className="cs-stat-value">{summary.worstPain}</span>
              <span className="cs-stat-label">Worst Pain</span>
            </div>
          )}
        </div>
        {(summary.topMoods.length > 0 || summary.topSymptoms.length > 0) && (
          <div className="cycle-summary-tags">
            {summary.topMoods.length > 0 && (
              <div className="cs-tag-group">
                <span className="cs-tag-label">Top Moods</span>
                <div className="cs-tags">
                  {summary.topMoods.map(m => (
                    <span key={m} className="cs-tag mood-tag">{moodLabels[m] || m}</span>
                  ))}
                </div>
              </div>
            )}
            {summary.topSymptoms.length > 0 && (
              <div className="cs-tag-group">
                <span className="cs-tag-label">Top Symptoms</span>
                <div className="cs-tags">
                  {summary.topSymptoms.map(s => (
                    <span key={s} className="cs-tag symptom-tag">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="analysis-page" id="analysis-page">
      <div className="page-header">
        <div>
          <h1 className="text-h1">Cycle Analysis</h1>
          <p className="text-caption">Trends, patterns & insights from your logs</p>
        </div>
        <button className="btn btn-primary export-btn" onClick={handleExport} id="export-excel-btn">
          <Download size={16} />
          Export to Excel
        </button>
      </div>

      {/* Period Timing Alert */}
      {currentCycleStatus && (
        <div className="period-timing-alert analysis-alert animate-fade-in-up" style={{ '--alert-color': currentCycleStatus.color }}>
          <AlertTriangle size={18} />
          <span>{currentCycleStatus.emoji} {currentCycleStatus.label}</span>
        </div>
      )}

      {/* Today's Input Summary */}
      {logSummaryFields.length > 0 && (
        <div className="today-summary-section animate-fade-in-up">
          <h3 className="section-title">
            <Calendar size={18} />
            Today's Log Summary
          </h3>
          <div className="today-summary-grid">
            {logSummaryFields.map((field, i) => (
              <div key={i} className="today-summary-item" style={{ '--accent': field.color }}>
                <div className="today-summary-icon">{field.icon}</div>
                <div>
                  <p className="today-summary-label">{field.label}</p>
                  <p className="today-summary-value">{field.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wellness Score */}
      {wellnessScore !== null && (
        <div className="wellness-score-card card-flat animate-fade-in-up">
          <div className="wellness-header">
            <Award size={22} style={{ color: getScoreColor(wellnessScore) }} />
            <h3 className="section-title">Wellness Score</h3>
          </div>
          <div className="wellness-body">
            <div className="wellness-ring" style={{ '--score-color': getScoreColor(wellnessScore) }}>
              <svg viewBox="0 0 100 100" className="wellness-svg">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-light)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={getScoreColor(wellnessScore)} strokeWidth="8"
                  strokeDasharray={`${wellnessScore * 2.64} 264`}
                  strokeLinecap="round" transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="wellness-score-text">
                <span className="wellness-number">{wellnessScore}</span>
                <span className="wellness-max">/100</span>
              </div>
            </div>
            <div className="wellness-details">
              <p className="wellness-label" style={{ color: getScoreColor(wellnessScore) }}>{getScoreLabel(wellnessScore)}</p>
              <p className="wellness-desc">Based on your pain, sleep, water, stress, energy & mood today.</p>
              <div className="wellness-breakdown">
                <div className="breakdown-item"><span>Pain</span><span className="breakdown-weight">30%</span></div>
                <div className="breakdown-item"><span>Sleep</span><span className="breakdown-weight">20%</span></div>
                <div className="breakdown-item"><span>Water</span><span className="breakdown-weight">15%</span></div>
                <div className="breakdown-item"><span>Stress</span><span className="breakdown-weight">15%</span></div>
                <div className="breakdown-item"><span>Energy</span><span className="breakdown-weight">10%</span></div>
                <div className="breakdown-item"><span>Mood</span><span className="breakdown-weight">10%</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== Cycle-Level Analysis ====== */}
      {activeCycleSummary && renderCycleSummaryCard(activeCycleSummary, 'Current Cycle Summary', true)}
      {cycleSummary && renderCycleSummaryCard(cycleSummary, 'Last Completed Cycle')}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card card-flat">
          <Calendar size={18} className="stat-icon" />
          <div className="stat-value">{totalCycles}</div>
          <div className="stat-label">Total Cycles</div>
        </div>
        <div className="stat-card card-flat">
          <Activity size={18} className="stat-icon" />
          <div className="stat-value">{avgLength}</div>
          <div className="stat-label">Average Length</div>
        </div>
        <div className="stat-card card-flat">
          <TrendingUp size={18} className="stat-icon" />
          <div className="stat-value">{shortest}–{longest}</div>
          <div className="stat-label">Range</div>
        </div>
        <div className="stat-card card-flat">
          <TrendingUp size={18} className="stat-icon" />
          <div className="stat-value">{predictedLength}</div>
          <div className="stat-label">Expected Next</div>
        </div>
      </div>

      {/* Cycle Length History */}
      <div className="analysis-card card">
        <h3 className="widget-title">Cycle Length Over Time</h3>
        <p className="widget-subtitle">How your cycle varies from month to month</p>
        <div className="analysis-chart">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cycleLengthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}>
                <Label value="Month" offset={-5} position="insideBottom" style={{ fontSize: '11px', fill: 'var(--text-secondary)', fontWeight: 600 }} />
              </XAxis>
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}>
                <Label value="Cycle Length (Days)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: '11px', fill: 'var(--text-secondary)', fontWeight: 600 }} />
              </YAxis>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '10px',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine y={NORMAL_CYCLE_MIN} stroke="var(--success)" strokeDasharray="4 4" label={{ value: `Min (${NORMAL_CYCLE_MIN}d)`, position: 'right', style: { fontSize: '9px', fill: 'var(--success)' } }} />
              <ReferenceLine y={NORMAL_CYCLE_MAX} stroke="var(--warning)" strokeDasharray="4 4" label={{ value: `Max (${NORMAL_CYCLE_MAX}d)`, position: 'right', style: { fontSize: '9px', fill: 'var(--warning)' } }} />
              <Bar dataKey="length" fill="var(--pink-400)" radius={[6, 6, 0, 0]} name="Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Body Temperature Trend */}
      {bbtTrend.length > 0 && (
        <div className="analysis-card card">
          <h3 className="widget-title">Body Temperature Trend (BBT)</h3>
          <p className="widget-subtitle">Last {bbtTrend.length} days of basal body temperature</p>
          <div className="analysis-chart">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bbtTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}>
                  <Label value="Date" offset={-5} position="insideBottom" style={{ fontSize: '11px', fill: 'var(--text-secondary)', fontWeight: 600 }} />
                </XAxis>
                <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}>
                  <Label value="Temperature (°C)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: '11px', fill: 'var(--text-secondary)', fontWeight: 600 }} />
                </YAxis>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
                <Line type="monotone" dataKey="temp" stroke="var(--pink-500)" strokeWidth={2} dot={{ r: 3, fill: 'var(--pink-500)' }} name="Temperature (°C)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mood Distribution */}
      {moodData.length > 0 && (
        <div className="analysis-card card">
          <h3 className="widget-title">Your Mood Patterns</h3>
          <p className="widget-subtitle">Most common moods from your logs</p>
          <div className="analysis-chart">
            <ResponsiveContainer width="100%" height={Math.max(160, moodData.length * 32)}>
              <BarChart data={moodData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }}>
                  <Label value="Frequency" offset={-5} position="insideBottom" style={{ fontSize: '11px', fill: 'var(--text-secondary)', fontWeight: 600 }} />
                </XAxis>
                <YAxis dataKey="mood" type="category" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={120}>
                  <Label value="Mood" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: '11px', fill: 'var(--text-secondary)', fontWeight: 600 }} />
                </YAxis>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="var(--pink-300)" radius={[0, 6, 6, 0]} name="Times" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div style={{ height: 'var(--space-2xl)' }} />
    </div>
  );
}
