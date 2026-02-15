import React, { useEffect, useMemo } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { useTypingEngine } from '../hooks/useTypingEngine';
import WordDisplay from './WordDisplay';
import DefinitionBox from './DefinitionBox';
import StatsSummary from './StatsSummary';
import CelebrationOverlay from './CelebrationOverlay';
import ScoresProgressScreen from './ScoresProgressScreen';
import { DIFFICULTIES, getDifficulty } from '../data/difficulty';

const fmtPct = (n) => `${Math.round((n ?? 0) * 100)}%`;

const GameContainer = () => {
  const { state, dispatch } = useGameState();
  const { typedCorrectly } = useTypingEngine();

  const diff = useMemo(() => getDifficulty(state.difficultyKey), [state.difficultyKey]);

  // Timer
  useEffect(() => {
    if (state.status !== 'playing') return;

    const id = window.setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => window.clearInterval(id);
  }, [state.status, dispatch]);

  useEffect(() => {
    if (state.status !== 'playing') return;
    if (state.timer.timeLeftSec > 0) return;
    dispatch({ type: 'TIMEOUT' });
  }, [state.timer.timeLeftSec, state.status, dispatch]);

  // Keyboard capture
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (state.status !== 'playing') return;

      if (e.key === 'Escape') {
        dispatch({ type: 'RESET_SESSION' });
        return;
      }

      if (e.key === 'Backspace') {
        dispatch({ type: 'UPDATE_INPUT', payload: state.userInput.slice(0, -1) });
        return;
      }

      if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        const nextChar = e.key.toLowerCase();
        const currentWord = state.words[state.currentWordIndex]?.word;
        const expectedChar = currentWord ? currentWord[state.userInput.length] : undefined;

        const isCorrect = !!expectedChar && expectedChar === nextChar;
        dispatch({ type: 'KEYSTROKE', payload: { isCorrect } });

        dispatch({ type: 'UPDATE_INPUT', payload: state.userInput + nextChar });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.status, state.userInput, dispatch, state.currentWordIndex, state.words]);

  if (state.screen === 'scores') {
    return <ScoresProgressScreen />;
  }

  if (state.status === 'completed') {
    return <StatsSummary />;
  }

  const Shell = ({ children }) => (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-fuchsia-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </div>
  );

  if (state.status === 'stageCleared' && state.ui.showCelebration) {
    return (
      <>
        <Shell>
          <div className="rounded-3xl bg-white/80 backdrop-blur border border-white shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500" />
            <div className="p-8 md:p-12">
              <div className="text-slate-600">Preparing next stage…</div>
            </div>
          </div>
        </Shell>

        <CelebrationOverlay
          reward={state.ui.lastStageReward}
          stageId={state.stage.id}
          onContinue={() => dispatch({ type: 'CONTINUE_AFTER_STAGE' })}
        />
      </>
    );
  }

  if (state.status === 'idle') {
    return (
      <Shell>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-full max-w-3xl rounded-3xl bg-white/80 backdrop-blur border border-white shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500" />
            <div className="p-8 md:p-12 text-center">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
                Typing Practice
              </h1>
              <p className="mt-4 text-slate-600 text-lg md:text-xl">
                Train vocabulary, accuracy, and speed—one stage at a time.
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-sm font-extrabold tracking-wider uppercase text-slate-500">Profile</div>
                  <label className="mt-3 block text-sm font-semibold text-slate-700">Name (optional)</label>
                  <input
                    value={state.profileName}
                    onChange={(e) => dispatch({ type: 'SET_PROFILE_NAME', payload: e.target.value })}
                    placeholder="Guest"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-200"
                  />

                  <button
                    onClick={() => dispatch({ type: 'NAVIGATE', payload: 'scores' })}
                    className="mt-4 w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-slate-800"
                  >
                    Scores & Progress
                  </button>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-sm font-extrabold tracking-wider uppercase text-slate-500">Difficulty</div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {Object.values(DIFFICULTIES).map((d) => (
                      <button
                        key={d.key}
                        onClick={() => dispatch({ type: 'SET_DIFFICULTY', payload: d.key })}
                        className={
                          state.difficultyKey === d.key
                            ? 'rounded-xl bg-indigo-600 text-white font-bold py-3'
                            : 'rounded-xl bg-white border border-slate-200 text-slate-900 font-bold py-3 hover:bg-slate-100'
                        }
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 text-sm text-slate-600">
                    <div>
                      Time/word: <span className="font-semibold">{diff.timeLimitSec}s</span>
                    </div>
                    <div className="mt-1">
                      Hints: <span className="font-semibold">{diff.hints.showDefinition ? 'Definition' : 'No definition'}</span>
                    </div>
                    <div className="mt-1">
                      Target letters: <span className="font-semibold">{diff.hints.showTargetLetters ? 'Visible' : 'Hidden'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => dispatch({ type: 'START_GAME' })}
                className="mt-10 inline-flex items-center justify-center rounded-2xl px-8 py-4 text-lg md:text-xl font-bold text-white shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-[0.99] transition"
              >
                Start Stage {state.progress.stageIndex + 1}
              </button>

              <div className="mt-6 text-sm text-slate-500">
                Tip: Just start typing—no input box needed. Press Esc to end a session.
              </div>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  const stageProgress = `${state.stage.correctInStage}/${state.stage.wordsToClear}`;

  return (
    <Shell>
      <div className="flex items-center justify-center">
        <div className="w-full rounded-3xl bg-white/80 backdrop-blur border border-white shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500" />

          <div className="p-6 md:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xs font-extrabold tracking-wider uppercase text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                  Stage {state.stage.id} • {stageProgress} • Min acc {fmtPct(state.stage.minAccuracy)}
                </div>

                <div className="text-xs font-extrabold tracking-wider uppercase text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                  Time: <span className={state.timer.timeLeftSec <= 3 ? 'text-rose-600' : 'text-slate-900'}>{state.timer.timeLeftSec}s</span>
                </div>

                <div className="text-xs font-extrabold tracking-wider uppercase text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                  {diff.label}
                </div>

                <div className="flex gap-2 text-sm">
                  <span className="px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold">✓ {state.stats.correctWords}</span>
                  <span className="px-3 py-2 rounded-full bg-rose-50 text-rose-700 font-bold">✗ {state.stats.errors}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600">
                  Stars: <span className="font-black text-amber-700">{state.progress.stars}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  Coins: <span className="font-black text-emerald-700">{state.progress.coins}</span>
                </div>

                <button
                  onClick={() => dispatch({ type: 'NAVIGATE', payload: 'scores' })}
                  className="rounded-xl px-4 py-2 font-bold bg-slate-900 text-white hover:bg-slate-800"
                >
                  Scores
                </button>
              </div>
            </div>

            <div className="mb-10">
              <WordDisplay typedCorrectly={typedCorrectly} showTargetLetters={diff.hints.showTargetLetters} />
            </div>

            <div className="border-t border-slate-100 pt-8">
              <DefinitionBox />
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default GameContainer;
