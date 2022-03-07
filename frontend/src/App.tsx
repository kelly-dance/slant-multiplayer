import React from 'react';
// import io from 'socket.io-client';
import { SinglePlayerBoardInterface } from './BoardInterface';
import Board from './components/Board';
import BoardFrame from './components/BoardFrame';
import SpecLoader from './components/SpecLoader';

function App() {
  const manager = new SinglePlayerBoardInterface();
  
  return (
    <>
      <SpecLoader manager={manager} />
      <br/>
      <button onClick={() => manager.undo()}>UNDO</button>
      <br/>
      <button onClick={() => manager.redo()}>REDO</button>
      <br/>
      <BoardFrame>
        <Board manager={manager} />
      </BoardFrame>
    </>
  );
}


export default App;
