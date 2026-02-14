import { useCallback } from 'react';

export const useTTS = () => {
  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Web Speech API not supported in this browser.');
    }
  }, []);

  return { speak };
};
