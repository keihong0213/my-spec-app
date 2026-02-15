export const DIFFICULTIES = {
  easy: {
    key: 'easy',
    label: 'Easy',
    wordLength: { min: 3, max: 6 },
    timeLimitSec: 12,
    hints: { showDefinition: true, showTargetLetters: true },
  },
  normal: {
    key: 'normal',
    label: 'Normal',
    wordLength: { min: 5, max: 8 },
    timeLimitSec: 9,
    hints: { showDefinition: true, showTargetLetters: true },
  },
  hard: {
    key: 'hard',
    label: 'Hard',
    wordLength: { min: 8, max: 24 },
    timeLimitSec: 6,
    hints: { showDefinition: false, showTargetLetters: false },
  },
};

export const getDifficulty = (key) => DIFFICULTIES[key] ?? DIFFICULTIES.normal;
