import React, { useEffect, useState } from 'react';
import { LState, BoardState } from 'slant';
import { BoardInterface } from '../BoardInterface';

const Board = ({ manager }: { manager: BoardInterface }) => {
  const maxDim = Math.max(manager.width, manager.height);
  const boxSize = 800/maxDim;
  const hintSize = boxSize/2.5;

  const hintStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${hintSize}px`,
    height: `${hintSize}px`,
    border: '2px solid black',
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: `${hintSize}px`,
    backgroundColor: 'white',
    fontSize: `${hintSize/1.1}px`,
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
    zIndex: 100,
    userSelect: 'none',
  }

  const [board, setBoard] = useState<BoardState>(manager.getBoard());

  useEffect (() => {
    manager.onUpdate(board => {
      setBoard({...board});
      console.log(board)
    })
  }, [manager]);

  return (
    <div style={{margin: '60px', position: 'relative'}}>
      <div style={{display: 'table', border: '1px solid black', width: `${boxSize * board.lines[0].length}px`}}>
        {board.lines.map((row, i) => {
          return (
            <div key={i} style={{height: `${boxSize}px`, display: 'table-row'}}>
              {row.map((_, j) => {
                const box = board.lines[i][j];
                return (
                  <div
                    key={j}
                    style={{width: `${boxSize}px`, display: 'table-cell', position: 'relative'}}
                    onClick={() => {
                      manager.update({
                        orientation: (box.orientation + 1) % 3,
                        r: i,
                        c: j,
                      });
                    }}
                    onContextMenu={event => {
                      event.preventDefault();
                      manager.update({
                        orientation: (box.orientation + 2) % 3,
                        r: i,
                        c: j,
                      });
                    }}
                  >
                    <div style={{width: `100%`, height: `100%`, position: 'absolute', border: '1px solid black'}} />
                    {
                      box.orientation === LState.None ? '' :
                      <svg width={boxSize} height={boxSize} style={{position: 'absolute', top: '0', left: '0'}}>
                        <line x1="0" y1={box.orientation === LState.Left ? 0 : boxSize} x2={boxSize} y2={box.orientation === LState.Left ? boxSize : 0} stroke={box.isLoop ? 'red' : 'black'} strokeWidth="2" />
                      </svg>
                    }
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div>
        {board.clues.flatMap((row, i) => {
          return row.map(({ clue, satisfiable }, j) => {
            if(clue === -1) return '';
            return (
              <div
                key={`${i},${j}`}
                style={{
                ...hintStyle,
                top: `${-hintSize/2 + boxSize * i}px`,
                left: `${-hintSize/2 + boxSize * j}px`,
                color: satisfiable ? 'black' : 'red',
                }}
              >{clue}</div>
            )
          });
        })}
      </div>
    </div>
    
  );
}

export default Board;
