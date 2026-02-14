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
      speak(currentWord); // Speak the word immediately
      setTimeout(() => {
        dispatch({ type: 'CORRECT_WORD' });
        setTypedCorrectly(false);
      }, 500); // Small delay for feedback
    }

    // Check for errors: if user input doesn't match the prefix of current word
    // We need to count errors only ONCE per wrong keystroke.
    // However, since we don't have access to the *previous* input here easily without extra state,
    // let's rely on GameContainer to dispatch errors, or check input length change.
    
    // Actually, dispatching ADD_ERROR from GameContainer is safer for counting keystrokes.
    // So we leave this empty here and handle it in GameContainer.
  }, [state.userInput, state.currentWordIndex, state.status, dispatch, state.words, speak]);

  return { typedCorrectly };
};
