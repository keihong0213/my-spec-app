import React from 'react';
import { useGameState } from '../contexts/GameStateContext';

const DefinitionBox = () => {
  const { state } = useGameState();
  const definition = state.words[state.currentWordIndex]?.definition;

  if (!definition) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-8 text-xl text-gray-700 italic">
      "{definition}"
    </div>
  );
};

export default DefinitionBox;
