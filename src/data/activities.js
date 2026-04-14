/**
 * Exercise recommendations per cycle phase
 */

export const phaseActivities = {
  menstruation: {
    title: 'Gentle Movement',
    description: 'Listen to your body. Low-impact activities help with cramps.',
    activities: [
      { name: 'Walking', emoji: '🚶‍♀️', duration: '20-30 min' },
      { name: 'Yoga', emoji: '🧘', duration: '20 min' },
      { name: 'Stretching', emoji: '🤸', duration: '15 min' },
      { name: 'Light Swimming', emoji: '🏊‍♀️', duration: '20 min' },
    ],
  },
  follicular: {
    title: 'Time to Push!',
    description: 'Estrogen is rising — energy is high. Challenge yourself!',
    activities: [
      { name: 'HIIT', emoji: '🔥', duration: '25-40 min' },
      { name: 'Running', emoji: '🏃‍♀️', duration: '30-45 min' },
      { name: 'Strength Training', emoji: '💪', duration: '45 min' },
      { name: 'Dance', emoji: '💃', duration: '30 min' },
    ],
  },
  ovulation: {
    title: 'Peak Performance',
    description: 'At your strongest! Max energy and endurance.',
    activities: [
      { name: 'High-Intensity', emoji: '⚡', duration: '30-45 min' },
      { name: 'CrossFit', emoji: '🏋️‍♀️', duration: '45 min' },
      { name: 'Cycling', emoji: '🚴‍♀️', duration: '40 min' },
      { name: 'Group Sports', emoji: '🤾‍♀️', duration: '60 min' },
    ],
  },
  luteal: {
    title: 'Wind Down',
    description: 'Energy decreasing. Focus on recovery and mindfulness.',
    activities: [
      { name: 'Pilates', emoji: '🧘‍♀️', duration: '30 min' },
      { name: 'Yoga Flow', emoji: '🌙', duration: '30 min' },
      { name: 'Moderate Walk', emoji: '🌳', duration: '30 min' },
      { name: 'Tai Chi', emoji: '☯️', duration: '25 min' },
    ],
  },
};
