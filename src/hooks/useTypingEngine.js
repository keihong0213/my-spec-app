import { useState, useEffect } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { useTTS } from './useTTS';

export const useTypingEngine = () => {
  const { state, dispatch } = useGameState();
  const [typedCorrectly, setTypedCorrectly] = useState(false);
  const { speak } = useTTS();

  useEffect(() => {
    if (state.status !== 'playing') return;

    const currentWord = state.words[state.currentWordIndex]?.word;

    if (!currentWord) {
      dispatch({ type: 'COMPLETE_GAME' });
      return;
    }

    if (state.userInput === currentWord) {
      setTypedCorrectly(true);
      speak(currentWord);
      setTimeout(() => {
        dispatch({ type: 'CORRECT_WORD' });
        setTypedCorrectly(false);
      }, 400);
    }
  }, [state.userInput, state.currentWordIndex, state.status, dispatch, state.words, speak]);

  return { typedCorrectly };
};
