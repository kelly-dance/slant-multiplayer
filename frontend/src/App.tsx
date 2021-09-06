import React from 'react';
import { SinglePlayerBoardInterface } from './BoardInterface';
import Board from './components/Board';

function App() {
  const manager = new SinglePlayerBoardInterface();

  return (
    <Board manager={manager} />
  );
}

export default App;
