import React from 'react';
import { GameState, BoxState } from '../types'; 

const Board = ({ state, update }: { state: GameState, update: (x: number, y: number, boxState: BoxState) => void }) => {
  const maxDim = Math.max(state.boxes.length, state.boxes[0].length);
  const boxSize = 800/maxDim;
  const hintSize = boxSize/4;

  const hintStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${hintSize}px`,
    height: `${hintSize}px`,
    border: '2px solid black',
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: `${hintSize}px`,
    backgroundColor: 'white',
    fontSize: `${hintSize/1.8}px`,
    fontFamily: 'Arial, sans-serif',
    zIndex: 100,
    userSelect: 'none',
  }

  return (
    <div style={{display: 'table', margin: '60px', border: '1px solid black'}}>
      {state.boxes.map((row, i) => {
        return (
          <div key={i} style={{height: `${boxSize}px`, display: 'table-row'}}>
            {row.map((_, j) => {
              const box = state.boxes[i][j];
              return (
                <div
                  key={j}
                  style={{width: `${boxSize}px`, display: 'table-cell', position: 'relative'}}
                  onClick={() => {
                    update(i, j, [BoxState.EMPTY, BoxState.FORWARD, BoxState.BACKWARD][(box + 1) % 3])
                  }}
                  onContextMenu={event => {
                    event.preventDefault();
                    update(i, j, [BoxState.EMPTY, BoxState.FORWARD, BoxState.BACKWARD][(box + 2) % 3])
                  }}
                >
                  <div style={{width: `100%`, height: `100%`, position: 'absolute', border: '1px solid black'}} />
                  {
                    box === BoxState.EMPTY ? '' :
                    <svg width={boxSize} height={boxSize} style={{position: 'absolute', top: '0', left: '0'}}>
                      <line x1="0" y1={box === BoxState.FORWARD ? 0 : boxSize} x2={boxSize} y2={box === BoxState.FORWARD ? boxSize : 0} stroke="black" strokeWidth="2" />
                    </svg>
                  }
                  {
                    i === state.boxes.length - 1 && state.clues[i+1][j] !== undefined ?
                      <div style={{
                        ...hintStyle,
                        bottom: `-${hintSize/2}px`,
                        left: `-${hintSize/2}px`,
                      }}>{state.clues[i+1][j]}</div> :
                      ''
                  }
                  {
                    j === state.boxes[0].length - 1 && state.clues[i][j+1] !== undefined ?
                      <div style={{
                        ...hintStyle,
                        top: `-${hintSize/2}px`,
                        right: `-${hintSize/2}px`,
                      }}>{state.clues[i][j+1]}</div> :
                      ''
                  }
                  {
                    i === state.boxes.length - 1 && j === state.boxes[0].length - 1 && state.clues[i][j+1] !== undefined ?
                      <div style={{
                        ...hintStyle,
                        bottom: `-${hintSize/2}px`,
                        right: `-${hintSize/2}px`,
                      }}>{state.clues[i][j+1]}</div> :
                      ''
                  }
                  {
                    state.clues[i][j] !== undefined ?
                      <div style={{
                        ...hintStyle,
                        top: `-${hintSize/2}px`,
                        left: `-${hintSize/2}px`,
                      }}>{state.clues[i][j]}</div> :
                      ''
                  }
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default Board;
