import React from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { getDifficulty } from '../data/difficulty';

const DefinitionBox = () => {
  const { state } = useGameState();
  const definition = state.words[state.currentWordIndex]?.definition;
  const diff = getDifficulty(state.difficultyKey);

  if (!definition) return null;
  if (!diff.hints.showDefinition) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-8 text-xl text-gray-700 italic">
      "{definition}"
    </div>
  );
};

export default DefinitionBox;
