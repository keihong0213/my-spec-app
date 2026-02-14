import React, { createContext, useReducer, useContext } from 'react';
import vocabulary from '../data/vocabulary.json';

const GameStateContext = createContext();

const initialState = {
  status: 'idle', // idle, playing, completed
  currentWordIndex: 0,
  userInput: '',
  score: { correct: 0, errors: 0 },
  words: vocabulary,
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        status: 'playing',
        words: [...vocabulary].sort(() => Math.random() - 0.5), // Shuffle words
      };
    case 'UPDATE_INPUT':
      return { ...state, userInput: action.payload };
    case 'CORRECT_WORD':
      return {
        ...state,
        score: { ...state.score, correct: state.score.correct + 1 },
        userInput: '',
        currentWordIndex: state.currentWordIndex + 1,
      };
    case 'COMPLETE_GAME':
      return { ...state, status: 'completed' };
    case 'ADD_ERROR':
      return {
        ...state,
        score: { ...state.score, errors: state.score.errors + 1 },
      };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
};

export const GameStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => useContext(GameStateContext);
