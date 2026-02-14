import React from 'react';
import { useGameState } from '../contexts/GameStateContext';

const WordDisplay = ({ typedCorrectly }) => {
  const { state } = useGameState();
  const currentWord = state.words[state.currentWordIndex]?.word;

  if (!currentWord) return null;

  return (
    <div className={`text-6xl font-bold tracking-widest transition-colors ${typedCorrectly ? 'text-green-500' : 'text-gray-800'}`}>
      {currentWord.split('').map((char, index) => {
        const isTyped = index < state.userInput.length;
        const isCorrect = isTyped && state.userInput[index] === char;
        const isCurrent = index === state.userInput.length;

        return (
          <span
            key={index}
            className={`${
              isCorrect
                ? 'text-green-600'
                : isTyped 
                ? 'text-red-500 line-through' // Show wrong typed letters in red
                : isCurrent
                ? 'underline decoration-blue-500 text-gray-800'
                : 'text-gray-400'
            }`}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

export default WordDisplay;
