import React from 'react';
import { GameStateProvider } from './contexts/GameStateContext';
import GameContainer from './components/GameContainer';
import './index.css';

function App() {
  return (
    <GameStateProvider>
      <GameContainer />
    </GameStateProvider>
  );
}

export default App;
