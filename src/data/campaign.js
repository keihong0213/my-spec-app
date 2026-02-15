export const CAMPAIGN_STAGES = [
  { id: 1, wordsToClear: 5, minAccuracy: 0.85, reward: { stars: 1, coins: 10 } },
  { id: 2, wordsToClear: 7, minAccuracy: 0.88, reward: { stars: 1, coins: 15 } },
  { id: 3, wordsToClear: 9, minAccuracy: 0.9, reward: { stars: 2, coins: 20 } },
  { id: 4, wordsToClear: 12, minAccuracy: 0.92, reward: { stars: 2, coins: 30 } },
  { id: 5, wordsToClear: 15, minAccuracy: 0.94, reward: { stars: 3, coins: 40 } },
];

export const getStage = (index) => CAMPAIGN_STAGES[index] ?? CAMPAIGN_STAGES[CAMPAIGN_STAGES.length - 1];
