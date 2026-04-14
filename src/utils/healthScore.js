/**
 * Quick Health Score Calculator (1-10)
 * Based on today's logged symptoms + phase context
 */

export function calculateHealthScore(dailyLog, phase) {
  let score = 8; // default healthy baseline

  if (!dailyLog) return score;

  // Flow impact
  if (dailyLog.flow === 'heavy') score -= 1.5;
  if (dailyLog.flow === 'medium') score -= 0.5;

  // Pain impact
  if (dailyLog.pain === 'intense') score -= 2;
  if (dailyLog.pain === 'mild') score -= 0.5;

  // Mood impact
  const negativeMoods = ['sad', 'anxious', 'angry', 'tired'];
  const positiveMoods = ['happy', 'calm', 'energetic'];
  if (negativeMoods.includes(dailyLog.mood)) score -= 1;
  if (positiveMoods.includes(dailyLog.mood)) score += 0.5;

  // Sleep impact
  if (dailyLog.sleep === 'poor') score -= 1;
  if (dailyLog.sleep === 'good') score += 0.5;

  // Stress impact
  if (dailyLog.stress === 'high') score -= 1.5;
  if (dailyLog.stress === 'low') score += 0.5;

  // Clamp between 1 and 10
  return Math.max(1, Math.min(10, Math.round(score)));
}

export function getScoreLabel(score) {
  if (score >= 9) return 'Excellent';
  if (score >= 7) return 'Good';
  if (score >= 5) return 'Fair';
  if (score >= 3) return 'Low';
  return 'Rest needed';
}

export function getScoreColor(score) {
  if (score >= 8) return 'var(--success)';
  if (score >= 6) return 'var(--phase-follicular)';
  if (score >= 4) return 'var(--warning)';
  return 'var(--error)';
}
