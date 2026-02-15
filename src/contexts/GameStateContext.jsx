import React, { createContext, useReducer, useContext, useEffect } from 'react';
import vocabulary from '../data/vocabulary.json';
import { getDifficulty } from '../data/difficulty';
import { CAMPAIGN_STAGES, getStage } from '../data/campaign';
import { loadProfile, saveProfile } from '../utils/storage';

const GameStateContext = createContext();

const pickWordsForDifficulty = (difficultyKey) => {
  const diff = getDifficulty(difficultyKey);
  const { min, max } = diff.wordLength;

  const filtered = vocabulary.filter((w) => {
    const len = (w.word ?? '').length;
    return len >= min && len <= max;
  });

  const source = filtered.length >= 10 ? filtered : vocabulary;
  return [...source].sort(() => Math.random() - 0.5);
};

const computeMetrics = (stats) => {
  const totalKeystrokes = Math.max(stats.totalKeystrokes, 0);
  const correctKeystrokes = Math.max(stats.correctKeystrokes, 0);
  const errors = Math.max(stats.errors, 0);

  const accuracy = totalKeystrokes === 0 ? 1 : correctKeystrokes / totalKeystrokes;

  const now = Date.now();
  const startedAt = stats.startedAt ?? now;
  const elapsedMs = Math.max((stats.endedAt ?? now) - startedAt, 1);
  const minutes = elapsedMs / 60000;

  // WPM-like: standard 5 chars = 1 word
  const grossWpm = totalKeystrokes === 0 ? 0 : (totalKeystrokes / 5) / minutes;
  const netWpm = correctKeystrokes === 0 ? 0 : (correctKeystrokes / 5) / minutes;

  return { accuracy, grossWpm, netWpm, elapsedMs };
};

const initialFromProfile = () => {
  const profile = loadProfile();

  return {
    screen: 'game', // game | scores
    status: 'idle', // idle, playing, stageCleared, completed

    profileName: profile?.name ?? '',
    difficultyKey: profile?.difficultyKey ?? 'normal',

    // Progress/rewards persisted
    progress: {
      stageIndex: profile?.progress?.stageIndex ?? 0,
      stars: profile?.progress?.stars ?? 0,
      coins: profile?.progress?.coins ?? 0,
    },

    highScores: {
      bestNetWpm: profile?.highScores?.bestNetWpm ?? 0,
      bestAccuracy: profile?.highScores?.bestAccuracy ?? 0,
      bestSessionScore: profile?.highScores?.bestSessionScore ?? 0,
    },

    // Session game state
    words: pickWordsForDifficulty(profile?.difficultyKey ?? 'normal'),
    currentWordIndex: 0,
    userInput: '',

    timer: {
      timeLimitSec: getDifficulty(profile?.difficultyKey ?? 'normal').timeLimitSec,
      timeLeftSec: getDifficulty(profile?.difficultyKey ?? 'normal').timeLimitSec,
    },

    stage: {
      ...getStage(profile?.progress?.stageIndex ?? 0),
      correctInStage: 0,
      stageKeystrokes: 0,
      stageCorrectKeystrokes: 0,
    },

    stats: {
      correctWords: 0,
      errors: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      streak: 0,
      maxStreak: 0,
      startedAt: null,
      endedAt: null,
      // per-word counters
      currentWordErrors: 0,
      currentWordKeystrokes: 0,
      currentWordCorrectKeystrokes: 0,
      sessionScore: 0,
    },

    ui: {
      lastStageReward: null,
      showCelebration: false,
    },
  };
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.payload };

    case 'SET_PROFILE_NAME':
      return { ...state, profileName: action.payload };

    case 'SET_DIFFICULTY': {
      const difficultyKey = action.payload;
      const diff = getDifficulty(difficultyKey);
      return {
        ...state,
        difficultyKey,
        timer: { ...state.timer, timeLimitSec: diff.timeLimitSec, timeLeftSec: diff.timeLimitSec },
        words: pickWordsForDifficulty(difficultyKey),
      };
    }

    case 'START_GAME': {
      const difficultyKey = state.difficultyKey;
      const diff = getDifficulty(difficultyKey);
      const stage = getStage(state.progress.stageIndex);

      return {
        ...state,
        status: 'playing',
        words: pickWordsForDifficulty(difficultyKey),
        currentWordIndex: 0,
        userInput: '',
        timer: { timeLimitSec: diff.timeLimitSec, timeLeftSec: diff.timeLimitSec },
        stage: {
          ...stage,
          correctInStage: 0,
          stageKeystrokes: 0,
          stageCorrectKeystrokes: 0,
        },
        stats: {
          correctWords: 0,
          errors: 0,
          totalKeystrokes: 0,
          correctKeystrokes: 0,
          streak: 0,
          maxStreak: 0,
          startedAt: Date.now(),
          endedAt: null,
          currentWordErrors: 0,
          currentWordKeystrokes: 0,
          currentWordCorrectKeystrokes: 0,
          sessionScore: 0,
        },
        ui: { ...state.ui, lastStageReward: null, showCelebration: false },
      };
    }

    case 'UPDATE_INPUT':
      return { ...state, userInput: action.payload };

    case 'KEYSTROKE': {
      // payload: { isCorrect: boolean }
      const isCorrect = !!action.payload?.isCorrect;

      const totalKeystrokes = state.stats.totalKeystrokes + 1;
      const correctKeystrokes = state.stats.correctKeystrokes + (isCorrect ? 1 : 0);
      const errors = state.stats.errors + (isCorrect ? 0 : 1);

      return {
        ...state,
        stats: {
          ...state.stats,
          totalKeystrokes,
          correctKeystrokes,
          errors,
          currentWordKeystrokes: state.stats.currentWordKeystrokes + 1,
          currentWordCorrectKeystrokes: state.stats.currentWordCorrectKeystrokes + (isCorrect ? 1 : 0),
          currentWordErrors: state.stats.currentWordErrors + (isCorrect ? 0 : 1),
        },
        stage: {
          ...state.stage,
          stageKeystrokes: state.stage.stageKeystrokes + 1,
          stageCorrectKeystrokes: state.stage.stageCorrectKeystrokes + (isCorrect ? 1 : 0),
        },
      };
    }

    case 'TICK': {
      if (state.status !== 'playing') return state;
      const next = Math.max(0, state.timer.timeLeftSec - 1);
      return { ...state, timer: { ...state.timer, timeLeftSec: next } };
    }

    case 'TIMEOUT': {
      if (state.status !== 'playing') return state;

      // Timeout counts as a miss: reset streak, move to next word
      const diff = getDifficulty(state.difficultyKey);
      return {
        ...state,
        userInput: '',
        currentWordIndex: state.currentWordIndex + 1,
        timer: { ...state.timer, timeLeftSec: diff.timeLimitSec },
        stats: {
          ...state.stats,
          streak: 0,
          currentWordErrors: 0,
          currentWordKeystrokes: 0,
          currentWordCorrectKeystrokes: 0,
        },
      };
    }

    case 'CORRECT_WORD': {
      const diff = getDifficulty(state.difficultyKey);
      const perfectWord = state.stats.currentWordErrors === 0;

      const streak = perfectWord ? state.stats.streak + 1 : 0;
      const maxStreak = Math.max(state.stats.maxStreak, streak);

      const correctWords = state.stats.correctWords + 1;
      const correctInStage = state.stage.correctInStage + 1;

      // Score: base 100, + streak bonus, - error penalty
      const base = 100;
      const streakBonus = Math.min(streak, 10) * 10;
      const errorPenalty = state.stats.currentWordErrors * 5;
      const sessionScore = Math.max(0, state.stats.sessionScore + base + streakBonus - errorPenalty);

      const nextState = {
        ...state,
        userInput: '',
        currentWordIndex: state.currentWordIndex + 1,
        timer: { ...state.timer, timeLeftSec: diff.timeLimitSec },
        stage: { ...state.stage, correctInStage },
        stats: {
          ...state.stats,
          correctWords,
          streak,
          maxStreak,
          currentWordErrors: 0,
          currentWordKeystrokes: 0,
          currentWordCorrectKeystrokes: 0,
          sessionScore,
        },
      };

      // Stage clear check: need N correct words and stage accuracy
      const stageStats = {
        totalKeystrokes: nextState.stage.stageKeystrokes,
        correctKeystrokes: nextState.stage.stageCorrectKeystrokes,
      };
      const stageAccuracy =
        stageStats.totalKeystrokes === 0 ? 1 : stageStats.correctKeystrokes / stageStats.totalKeystrokes;

      const stageCleared =
        nextState.stage.correctInStage >= nextState.stage.wordsToClear && stageAccuracy >= nextState.stage.minAccuracy;

      if (!stageCleared) return nextState;

      const reward = nextState.stage.reward;
      const nextStageIndex = Math.min(nextState.progress.stageIndex + 1, CAMPAIGN_STAGES.length - 1);

      return {
        ...nextState,
        status: 'stageCleared',
        progress: {
          ...nextState.progress,
          stageIndex: nextStageIndex,
          stars: nextState.progress.stars + reward.stars,
          coins: nextState.progress.coins + reward.coins,
        },
        ui: { ...nextState.ui, lastStageReward: reward, showCelebration: true },
      };
    }

    case 'CONTINUE_AFTER_STAGE': {
      const stage = getStage(state.progress.stageIndex);
      return {
        ...state,
        status: 'playing',
        stage: {
          ...stage,
          correctInStage: 0,
          stageKeystrokes: 0,
          stageCorrectKeystrokes: 0,
        },
        ui: { ...state.ui, showCelebration: false },
      };
    }

    case 'COMPLETE_GAME': {
      const endedAt = Date.now();
      const nextStats = { ...state.stats, endedAt };
      const metrics = computeMetrics(nextStats);

      return {
        ...state,
        status: 'completed',
        stats: nextStats,
        highScores: {
          bestNetWpm: Math.max(state.highScores.bestNetWpm, metrics.netWpm),
          bestAccuracy: Math.max(state.highScores.bestAccuracy, metrics.accuracy),
          bestSessionScore: Math.max(state.highScores.bestSessionScore, nextStats.sessionScore),
        },
      };
    }

    case 'RESET_SESSION': {
      // keep profile/progress/difficulty
      const diff = getDifficulty(state.difficultyKey);
      return {
        ...state,
        status: 'idle',
        currentWordIndex: 0,
        userInput: '',
        timer: { ...state.timer, timeLimitSec: diff.timeLimitSec, timeLeftSec: diff.timeLimitSec },
        words: pickWordsForDifficulty(state.difficultyKey),
        stage: {
          ...getStage(state.progress.stageIndex),
          correctInStage: 0,
          stageKeystrokes: 0,
          stageCorrectKeystrokes: 0,
        },
        stats: {
          correctWords: 0,
          errors: 0,
          totalKeystrokes: 0,
          correctKeystrokes: 0,
          streak: 0,
          maxStreak: 0,
          startedAt: null,
          endedAt: null,
          currentWordErrors: 0,
          currentWordKeystrokes: 0,
          currentWordCorrectKeystrokes: 0,
          sessionScore: 0,
        },
        ui: { ...state.ui, lastStageReward: null, showCelebration: false },
      };
    }

    case 'RESET_PROGRESS': {
      return {
        ...state,
        progress: { stageIndex: 0, stars: 0, coins: 0 },
      };
    }

    case 'RESET_HIGHSCORES': {
      return {
        ...state,
        highScores: { bestNetWpm: 0, bestAccuracy: 0, bestSessionScore: 0 },
      };
    }

    default:
      return state;
  }
};

export const GameStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialFromProfile);

  // Persist profile
  useEffect(() => {
    const metrics = computeMetrics(state.stats);

    const bestNetWpm = Math.max(state.highScores.bestNetWpm, metrics.netWpm);
    const bestAccuracy = Math.max(state.highScores.bestAccuracy, metrics.accuracy);
    const bestSessionScore = Math.max(state.highScores.bestSessionScore, state.stats.sessionScore);

    const profile = {
      name: state.profileName,
      difficultyKey: state.difficultyKey,
      progress: state.progress,
      highScores: { bestNetWpm, bestAccuracy, bestSessionScore },
    };

    saveProfile(profile);
  }, [state.profileName, state.difficultyKey, state.progress, state.highScores, state.stats]);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => useContext(GameStateContext);
export const useGameMetrics = () => {
  const { state } = useGameState();
  return computeMetrics(state.stats);
};
