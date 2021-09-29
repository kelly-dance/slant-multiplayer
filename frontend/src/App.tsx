import React from 'react';
import io from 'socket.io-client';
import { SinglePlayerBoardInterface } from './BoardInterface';
import Board from './components/Board';
import BoardFrame from './components/BoardFrame';
import SpecLoader from './components/SpecLoader';

function App() {
  const manager = new SinglePlayerBoardInterface();
  

  return (
    <>
      <BoardFrame>
        <Board manager={manager} />
      </BoardFrame>
      <SpecLoader manager={manager} />
    </>
  );
}


export default App;
