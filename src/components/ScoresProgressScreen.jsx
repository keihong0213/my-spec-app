import React, { useMemo } from 'react';
import { useGameMetrics, useGameState } from '../contexts/GameStateContext';
import { getDifficulty } from '../data/difficulty';
import { CAMPAIGN_STAGES } from '../data/campaign';

const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;

const ScoresProgressScreen = () => {
  const { state, dispatch } = useGameState();
  const metrics = useGameMetrics();

  const diff = useMemo(() => getDifficulty(state.difficultyKey), [state.difficultyKey]);
  const stage = CAMPAIGN_STAGES[state.progress.stageIndex] ?? CAMPAIGN_STAGES[0];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-fuchsia-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-3xl bg-white/80 backdrop-blur border border-white shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500" />

          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900">Scores & Progress</h1>
                <div className="mt-2 text-slate-600">
                  Profile: <span className="font-semibold">{state.profileName || 'Guest'}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  Difficulty: <span className="font-semibold">{diff.label}</span>
                </div>
              </div>

              <button
                onClick={() => dispatch({ type: 'NAVIGATE', payload: 'game' })}
                className="rounded-2xl px-5 py-3 font-bold bg-slate-900 text-white hover:bg-slate-800"
              >
                Back to Game
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-amber-50 p-5">
                <div className="text-slate-600 text-sm font-semibold">Stars</div>
                <div className="mt-1 text-4xl font-black text-amber-700">{state.progress.stars}</div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-5">
                <div className="text-slate-600 text-sm font-semibold">Coins</div>
                <div className="mt-1 text-4xl font-black text-emerald-700">{state.progress.coins}</div>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-5">
                <div className="text-slate-600 text-sm font-semibold">Current Stage</div>
                <div className="mt-1 text-4xl font-black text-indigo-700">{stage.id}</div>
                <div className="mt-2 text-sm text-slate-600">
                  Goal: {stage.wordsToClear} words • Min accuracy: {fmtPct(stage.minAccuracy)}
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-black text-slate-900">High Scores</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-slate-600 text-sm font-semibold">Best Net WPM</div>
                  <div className="mt-1 text-3xl font-black text-slate-900">{state.highScores.bestNetWpm.toFixed(1)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-slate-600 text-sm font-semibold">Best Accuracy</div>
                  <div className="mt-1 text-3xl font-black text-slate-900">{fmtPct(state.highScores.bestAccuracy)}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-slate-600 text-sm font-semibold">Best Session Score</div>
                  <div className="mt-1 text-3xl font-black text-slate-900">{Math.round(state.highScores.bestSessionScore)}</div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-black text-slate-900">Last Session</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white p-5 border border-slate-100">
                  <div className="text-slate-600 text-sm font-semibold">Score</div>
                  <div className="mt-1 text-3xl font-black">{Math.round(state.stats.sessionScore)}</div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-slate-100">
                  <div className="text-slate-600 text-sm font-semibold">Accuracy</div>
                  <div className="mt-1 text-3xl font-black">{fmtPct(metrics.accuracy)}</div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-slate-100">
                  <div className="text-slate-600 text-sm font-semibold">Net WPM</div>
                  <div className="mt-1 text-3xl font-black">{metrics.netWpm.toFixed(1)}</div>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-slate-100">
                  <div className="text-slate-600 text-sm font-semibold">Max Streak</div>
                  <div className="mt-1 text-3xl font-black">{state.stats.maxStreak}</div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex flex-col md:flex-row gap-3">
              <button
                onClick={() => dispatch({ type: 'RESET_PROGRESS' })}
                className="rounded-2xl px-5 py-4 font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                Reset Progress (Stage/Stars/Coins)
              </button>
              <button
                onClick={() => dispatch({ type: 'RESET_HIGHSCORES' })}
                className="rounded-2xl px-5 py-4 font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                Reset High Scores
              </button>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Resets are local to this browser (localStorage).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoresProgressScreen;
