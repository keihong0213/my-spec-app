import React from 'react';
import { useGameState } from '../contexts/GameStateContext';

const WordDisplay = ({ typedCorrectly, showTargetLetters = true }) => {
  const { state } = useGameState();
  const currentWord = state.words[state.currentWordIndex]?.word;

  if (!currentWord) return null;

  const wordChars = currentWord.split('');
  const input = state.userInput;

  // Current caret position (clamped to last segment)
  const activeIndex = Math.min(input.length, Math.max(wordChars.length - 1, 0));

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-slate-600 text-lg md:text-xl font-semibold">Type the word</div>

      {/* Segmented single input (OTP-style) */}
      <div
        className={
          [
            'select-none',
            'flex items-stretch justify-center overflow-hidden',
            'rounded-3xl border border-slate-200/80',
            'bg-white/70 backdrop-blur-sm shadow-sm',
          ].join(' ')
        }
        role="group"
        aria-label="Word input"
      >
        {wordChars.map((targetChar, index) => {
          const isTyped = index < input.length;
          const typedChar = isTyped ? input[index] : '';

          const isCorrect = isTyped && typedChar === targetChar;
          const isIncorrect = isTyped && typedChar !== targetChar;

          const isActive =
            !typedCorrectly &&
            index === activeIndex &&
            // Allow caret to remain visible even when input is at max length
            input.length <= wordChars.length;

          const showAsFaintTarget = !isTyped && showTargetLetters;

          const segmentBase = [
            'relative',
            'w-12 h-14 md:w-14 md:h-16',
            'flex items-center justify-center',
            'transition-colors duration-150',
          ].join(' ');

          const segmentState = isCorrect
            ? 'bg-emerald-200/70 text-emerald-950'
            : isIncorrect
              ? 'bg-rose-200/70 text-rose-950'
              : isActive
                ? 'bg-indigo-50 text-slate-900'
                : 'bg-transparent text-slate-900';

          const divider = index !== wordChars.length - 1 ? 'border-r border-slate-200/80' : '';

          return (
            <div
              key={index}
              className={`${segmentBase} ${segmentState} ${divider}`}
              aria-label={
                isCorrect
                  ? `Letter ${index + 1} correct`
                  : isIncorrect
                    ? `Letter ${index + 1} incorrect`
                    : isActive
                      ? `Letter ${index + 1} current`
                      : `Letter ${index + 1}`
              }
            >
              {/* Character */}
              <span
                className={
                  isTyped
                    ? 'font-black text-3xl md:text-4xl'
                    : 'font-extrabold text-3xl md:text-4xl text-slate-400/50'
                }
              >
                {isTyped ? typedChar : showAsFaintTarget ? targetChar : '•'}
              </span>

              {/* Caret */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="caret-blink absolute bottom-3 md:bottom-3.5 left-1/2 -translate-x-1/2 h-7 md:h-8 w-[2px] bg-indigo-500/80 rounded-full"
                />
              )}

              {/* Subtle active outline */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 ring-2 ring-indigo-400/35 cursor-pulse"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Sub-hint */}
      <div className="text-sm md:text-base text-slate-500">
        {typedCorrectly ? (
          <span className="font-semibold text-emerald-600">Nice! Press any key for the next word.</span>
        ) : (
          <span>
            Errors: <span className="font-semibold text-rose-600">{state.stats.errors}</span>
            <span className="mx-2 text-slate-300">•</span>
            Typed: <span className="font-semibold">{state.userInput.length}</span>/{wordChars.length}
          </span>
        )}
      </div>
    </div>
  );
};

export default WordDisplay;
