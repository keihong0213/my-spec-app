import React from 'react';
import { useGameMetrics, useGameState } from '../contexts/GameStateContext';

const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;

const StatsSummary = () => {
  const { state, dispatch } = useGameState();
  const metrics = useGameMetrics();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-2xl w-full overflow-hidden">
        <div className="h-2 -mx-8 md:-mx-12 -mt-8 md:-mt-12 mb-8 bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500" />

        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">Session Complete</h2>
        <p className="mt-3 text-slate-600">Track your accuracy, streak, and WPM—then push the next stage.</p>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl">
            <p className="text-slate-500 font-semibold text-sm">Score</p>
            <p className="text-3xl font-black">{Math.round(state.stats.sessionScore)}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl">
            <p className="text-emerald-700/80 font-semibold text-sm">Correct Words</p>
            <p className="text-3xl font-black text-emerald-800">{state.stats.correctWords}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-2xl">
            <p className="text-rose-700/80 font-semibold text-sm">Errors</p>
            <p className="text-3xl font-black text-rose-800">{state.stats.errors}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-2xl">
            <p className="text-indigo-700/80 font-semibold text-sm">Max Streak</p>
            <p className="text-3xl font-black text-indigo-800">{state.stats.maxStreak}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl">
            <p className="text-slate-500 font-semibold text-sm">Accuracy</p>
            <p className="text-3xl font-black">{fmtPct(metrics.accuracy)}</p>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-2xl">
            <p className="text-slate-500 font-semibold text-sm">Net WPM</p>
            <p className="text-3xl font-black">{metrics.netWpm.toFixed(1)}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-3">
          <button
            onClick={() => dispatch({ type: 'RESET_SESSION' })}
            className="flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 shadow-lg text-lg"
          >
            Play Again
          </button>
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', payload: 'scores' })}
            className="flex-1 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 shadow-lg text-lg"
          >
            Scores & Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsSummary;
