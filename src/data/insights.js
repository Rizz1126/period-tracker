/**
 * Contextual health insights based on phase + symptoms
 */

export const phaseInsights = {
  menstruation: [
    {
      title: 'Iron levels may drop during menstruation',
      body: 'Try eating iron-rich foods like spinach, red meat, lentils, or dark chocolate to maintain your energy.',
      icon: '🥗',
      type: 'nutrition',
    },
    {
      title: 'Rest is your superpower right now',
      body: 'Your body is working hard. Prioritize sleep and gentle movement like walking or stretching.',
      icon: '😴',
      type: 'wellness',
    },
    {
      title: 'Stay hydrated',
      body: 'Water helps reduce bloating and cramps. Aim for 8+ glasses today.',
      icon: '💧',
      type: 'nutrition',
    },
  ],
  follicular: [
    {
      title: 'Energy is rising!',
      body: 'Estrogen is increasing, boosting your mood and energy. Great time for challenging workouts and creative projects.',
      icon: '⚡',
      type: 'wellness',
    },
    {
      title: 'Skin feeling clearer?',
      body: 'Rising estrogen often improves skin. This is a great time for active skincare routines.',
      icon: '✨',
      type: 'wellness',
    },
  ],
  ovulation: [
    {
      title: 'Peak fertility window',
      body: 'You\'re at your most fertile. If trying to conceive, this is the optimal time. If not, use protection.',
      icon: '🌸',
      type: 'fertility',
    },
    {
      title: 'Social butterfly mode',
      body: 'Estrogen and testosterone peak, often making you feel more confident and social.',
      icon: '🦋',
      type: 'wellness',
    },
  ],
  luteal: [
    {
      title: 'Why do I feel bloated?',
      body: 'Progesterone causes water retention and slows digestion. Reduce salt intake and eat fiber-rich foods.',
      icon: '🤔',
      type: 'symptom',
    },
    {
      title: 'Breast tenderness is normal',
      body: 'Rising progesterone causes fluid retention in breast tissue. This usually resolves when your period starts.',
      icon: '💗',
      type: 'symptom',
    },
    {
      title: 'Craving sweets?',
      body: 'Progesterone increases appetite—especially for carbs. Try dark chocolate or fruit to satisfy cravings healthily.',
      icon: '🍫',
      type: 'nutrition',
    },
    {
      title: 'Magnesium can help with PMS',
      body: 'Foods high in magnesium (nuts, seeds, bananas) may reduce cramps, mood swings, and headaches.',
      icon: '🥜',
      type: 'nutrition',
    },
  ],
};

export const symptomInsights = {
  pain_intense: {
    title: 'Managing intense cramps',
    body: 'Apply a warm compress to your lower abdomen. NSAIDs like ibuprofen work best when taken at the first sign of pain.',
    icon: '🔥',
  },
  mood_sad: {
    title: 'Feeling down? It\'s hormonal',
    body: 'Fluctuating estrogen and serotonin can affect mood. Movement, sunlight, and social connection can help.',
    icon: '🌤️',
  },
  mood_anxious: {
    title: 'Anxiety can spike before your period',
    body: 'Dropping estrogen affects serotonin levels. Try breathing exercises, journaling, or a calming walk.',
    icon: '🧘',
  },
  sleep_poor: {
    title: 'Sleep disrupted?',
    body: 'Progesterone affects sleep quality. Keep your room cool, avoid screens before bed, and try magnesium supplements.',
    icon: '🌙',
  },
  stress_high: {
    title: 'High stress affects your cycle',
    body: 'Cortisol can delay ovulation and change cycle length. Prioritize stress management today.',
    icon: '🧠',
  },
};
