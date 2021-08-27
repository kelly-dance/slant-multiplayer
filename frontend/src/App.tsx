import React from 'react';
import { useState } from 'react';
import Board from './components/Board';
import { GameState, BoxState } from './types';

// const sampleBoard: GameState = {
//   boxes: [
//     [ BoxState.FORWARD, BoxState.EMPTY, BoxState.EMPTY ],
//     [ BoxState.BACKWARD, BoxState.EMPTY, BoxState.EMPTY ],
//     [ BoxState.FORWARD, BoxState.BACKWARD, BoxState.EMPTY ],
//   ],
//   clues: [
//     [0, 2, undefined, undefined],
//     [undefined, undefined, undefined, 4],
//     [3, undefined, undefined, undefined],
//     [undefined, undefined, 3, undefined],
//   ],
// }

const width = 4;
const height = 4;
const sampleBoard: GameState = {
  boxes: Array.from({length:width}, () => Array.from({length:height}, () => [BoxState.EMPTY, BoxState.FORWARD, BoxState.BACKWARD][Math.floor(Math.random() * 3)])),
  clues: Array.from({length:width+1}, () => Array.from({length:height+1}, () => [undefined, 1, 2, 3, 4][Math.floor(Math.random() * 5)])),
}

function App() {
  const [state, setState] = useState<GameState>(sampleBoard);

  const updateBoard = (x: number, y: number, boxState: BoxState) => {
    setState(old => {
      const copy = { ...old, boxes: old.boxes.map(r => r.slice(0)) };
      copy.boxes[x][y] = boxState;
      return copy;
    });
  }

  return (
    <Board state={state} update={updateBoard}/>
  );
}

export default App;
