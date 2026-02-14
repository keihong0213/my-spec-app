import React, { useEffect } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { useTypingEngine } from '../hooks/useTypingEngine';
import WordDisplay from './WordDisplay';
import DefinitionBox from './DefinitionBox';
import StatsSummary from './StatsSummary';

const GameContainer = () => {
  const { state, dispatch } = useGameState();
  const { typedCorrectly } = useTypingEngine();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (state.status !== 'playing') return;

      if (e.key === 'Backspace') {
        dispatch({ type: 'UPDATE_INPUT', payload: state.userInput.slice(0, -1) });
      } else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        const nextChar = e.key.toLowerCase();
        const currentWord = state.words[state.currentWordIndex]?.word;

        // Check if correct relative to current position
        if (currentWord && currentWord[state.userInput.length] !== nextChar) {
           dispatch({ type: 'ADD_ERROR' });
        }
        
        // Always update input to show errors visually
        dispatch({ type: 'UPDATE_INPUT', payload: state.userInput + nextChar });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.status, state.userInput, dispatch]);

  if (state.status === 'completed') {
    return <StatsSummary />;
  }

  if (state.status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-5xl font-extrabold text-blue-600 mb-8">Vocabulary Typing Tutor</h1>
        <button
          onClick={() => dispatch({ type: 'START_GAME' })}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full text-2xl transition-transform transform hover:scale-105 shadow-xl"
        >
          Start Playing
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-4">
      <div className="w-full max-w-4xl p-8 bg-white rounded-3xl shadow-2xl text-center relative overflow-hidden border-4 border-white">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
        
        <div className="flex justify-between items-center mb-12">
          <div className="text-gray-400 font-bold tracking-wider text-sm uppercase bg-gray-100 px-4 py-2 rounded-full">
            Word {state.currentWordIndex + 1} / {state.words.length}
          </div>
          <div className="flex gap-4 text-xl">
            <span className="text-green-600 font-bold">✓ {state.score.correct}</span>
            <span className="text-red-500 font-bold">✗ {state.score.errors}</span>
          </div>
        </div>

        <div className="mb-8">
           <WordDisplay typedCorrectly={typedCorrectly} />
        </div>
        
        <div className="border-t border-gray-100 pt-8">
          <DefinitionBox />
        </div>

        <div className="mt-12 text-gray-400 text-sm font-medium animate-pulse">
          Type the word shown above
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
