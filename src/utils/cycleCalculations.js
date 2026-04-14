/**
 * Cycle Calculation Utilities
 * Weighted Moving Average prediction + phase detection
 */

export const PHASES = {
  MENSTRUATION: 'menstruation',
  FOLLICULAR: 'follicular',
  OVULATION: 'ovulation',
  LUTEAL: 'luteal',
};

export const PHASE_INFO = {
  [PHASES.MENSTRUATION]: {
    label: 'Menstruation',
    emoji: '🩸',
    color: 'var(--phase-menstruation)',
    description: 'Your body is shedding the uterine lining.',
  },
  [PHASES.FOLLICULAR]: {
    label: 'Follicular',
    emoji: '🌱',
    color: 'var(--phase-follicular)',
    description: 'Estrogen rises, follicles develop in ovaries.',
  },
  [PHASES.OVULATION]: {
    label: 'Ovulation',
    emoji: '🌸',
    color: 'var(--phase-ovulation)',
    description: 'An egg is released. Peak fertility window.',
  },
  [PHASES.LUTEAL]: {
    label: 'Luteal',
    emoji: '🌙',
    color: 'var(--phase-luteal)',
    description: 'Progesterone rises. Body prepares for possible pregnancy.',
  },
};

/**
 * Weighted Moving Average prediction
 * Recent cycles weigh more heavily
 */
export function predictCycleLength(cycleLengths) {
  if (!cycleLengths || cycleLengths.length === 0) return 28;
  if (cycleLengths.length === 1) return cycleLengths[0];

  let weightedSum = 0;
  let totalWeight = 0;

  cycleLengths.forEach((length, index) => {
    const weight = index + 1; // newer = higher index = more weight
    weightedSum += length * weight;
    totalWeight += weight;
  });

  return Math.round(weightedSum / totalWeight);
}

/**
 * Determine current phase based on cycle day.
 * Uses a 14-day luteal phase assumption for dynamic prediction.
 */
export function getCurrentPhase(cycleDay, cycleLength = 28, periodLength = 5) {
  if (cycleDay <= periodLength) return PHASES.MENSTRUATION;

  const ovulationDay = getOvulationDay(cycleLength);
  const ovulationEnd = ovulationDay + 1;

  if (cycleDay < ovulationDay) return PHASES.FOLLICULAR;
  if (cycleDay <= ovulationEnd) return PHASES.OVULATION;
  return PHASES.LUTEAL;
}

export function getOvulationDay(cycleLength = 28) {
  return Math.max(1, cycleLength - 14);
}

export function getFertileWindow(cycleLength = 28) {
  const ovulationDay = getOvulationDay(cycleLength);
  return {
    start: Math.max(1, ovulationDay - 5),
    end: Math.min(cycleLength, ovulationDay + 1),
    ovulationDay,
  };
}

/**
 * Calculate days until next period
 */
export function daysUntilNextPeriod(cycleDay, predictedLength) {
  return Math.max(0, predictedLength - cycleDay);
}

/**
 * Calculate cycle day from last period start date
 */
export function getCycleDay(lastPeriodStart) {
  if (!lastPeriodStart) return 1;
  const start = new Date(lastPeriodStart);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffTime = today - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

/**
 * Estimated hormone levels based on cycle day (normalized 0-100)
 */
export function getHormoneLevels(cycleDay, cycleLength = 28) {
  const normalized = cycleDay / cycleLength;
  const ovulationPoint = 0.5;

  // Estrogen: rises in follicular, peaks at ovulation, dips, small rise in luteal
  let estrogen;
  if (normalized < ovulationPoint) {
    estrogen = 20 + 70 * Math.pow(normalized / ovulationPoint, 1.5);
  } else {
    const lutealProgress = (normalized - ovulationPoint) / (1 - ovulationPoint);
    estrogen = 90 - 40 * lutealProgress + 15 * Math.sin(lutealProgress * Math.PI);
  }

  // Progesterone: low until ovulation, rises significantly in luteal
  let progesterone;
  if (normalized < ovulationPoint) {
    progesterone = 10 + 5 * normalized;
  } else {
    const lutealProgress = (normalized - ovulationPoint) / (1 - ovulationPoint);
    progesterone = 15 + 70 * Math.sin(lutealProgress * Math.PI * 0.8);
  }

  // Testosterone: slight peak around ovulation
  let testosterone = 30 + 25 * Math.exp(-Math.pow((normalized - ovulationPoint) * 6, 2));

  return {
    estrogen: Math.round(Math.min(100, Math.max(0, estrogen))),
    progesterone: Math.round(Math.min(100, Math.max(0, progesterone))),
    testosterone: Math.round(Math.min(100, Math.max(0, testosterone))),
  };
}

/**
 * Get fertility level (0-100)
 */
export function getFertilityLevel(cycleDay, cycleLength = 28) {
  const ovulationDay = Math.round(cycleLength * 0.5);
  const distance = Math.abs(cycleDay - ovulationDay);
  if (distance <= 1) return 95;
  if (distance <= 2) return 80;
  if (distance <= 3) return 60;
  if (distance <= 5) return 30;
  return 10;
}

/**
 * Generate predictive text based on current state
 */
export function getPredictiveText(cycleDay, predictedLength, periodLength = 5) {
  const phase = getCurrentPhase(cycleDay, predictedLength, periodLength);
  const daysLeft = daysUntilNextPeriod(cycleDay, predictedLength);
  const fertility = getFertilityLevel(cycleDay, predictedLength);

  if (phase === PHASES.MENSTRUATION) {
    const daysInPeriod = periodLength - cycleDay + 1;
    if (daysInPeriod > 0) {
      return `Period day ${cycleDay} • ~${daysInPeriod} days remaining`;
    }
    return 'Period ending soon';
  }

  if (fertility >= 80) {
    return '🌟 High chance of pregnancy today';
  }

  if (daysLeft <= 3) {
    return `Period starts in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
  }

  if (daysLeft <= 7) {
    return `Period coming in ${daysLeft} days`;
  }

  return `Next period in ${daysLeft} days`;
}

/**
 * Format date to readable string
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get date string in YYYY-MM-DD format
 */
export function toDateString(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}
