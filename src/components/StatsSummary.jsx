import React from 'react';
import { useGameState } from '../contexts/GameStateContext';

const StatsSummary = () => {
  const { state, dispatch } = useGameState();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full">
        <h2 className="text-4xl font-extrabold text-blue-600 mb-6">Game Over!</h2>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-green-100 p-4 rounded-xl">
            <p className="text-gray-500 font-semibold">Correct Words</p>
            <p className="text-3xl font-bold text-green-700">{state.score.correct}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-xl">
            <p className="text-gray-500 font-semibold">Errors</p>
            <p className="text-3xl font-bold text-red-700">{state.score.errors}</p>
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'RESET_GAME' })}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full transition-transform transform hover:scale-105 shadow-lg text-xl"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default StatsSummary;
