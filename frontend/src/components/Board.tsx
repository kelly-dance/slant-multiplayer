import React, { useEffect, useState } from 'react';
import { LState, BoardState } from 'slant';
import { BoardInterface } from '../BoardInterface';

const makeSize = (manager: BoardInterface) => {
  return Math.min((window.innerWidth - 80) / manager.width, (window.innerHeight - 80) / manager.height);
}

const Board = ({ manager }: { manager: BoardInterface }) => {
  const [boxSize, setBoxSize] = useState(makeSize(manager));
  const hintSize = boxSize / 2;

  const hintStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${hintSize}px`,
    height: `${hintSize}px`,
    border: '1px solid black',
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: `${hintSize}px`,
    backgroundColor: 'white',
    fontSize: `${hintSize/1.1}px`,
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
    zIndex: 100,
    userSelect: 'none',
    pointerEvents: 'none',
  }

  const [board, setBoard] = useState<BoardState>(manager.getBoard());

  useEffect (() => {
    manager.onUpdate(board => {
      setBoard({...board});
      console.log(board)
    })
  }, [manager]);

  useEffect (() => {
    const handle = () => setBoxSize(makeSize(manager));
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [manager, board]);

  return (
    <div style={{margin: '50px', position: 'relative'}}>
      <div style={{display: 'table', border: '1px solid darkgrey', width: `${boxSize * board.lines[0].length}px`}}>
        {board.lines.map((row, i) => {
          return (
            <div key={i} style={{height: `${boxSize}px`, display: 'table-row'}}>
              {row.map((_, j) => {
                const box = board.lines[i][j];
                return (
                  <div
                    key={j}
                    style={{width: `${boxSize}px`, display: 'table-cell', position: 'relative'}}
                    onContextMenu={e => e.preventDefault()}
                    onMouseDown={e => {
                      console.log(e.button);
                      if(e.button === 0) {
                        manager.update({
                          orientation: (box.orientation + 1) % 3,
                          r: i,
                          c: j,
                        });
                      }else if(e.button === 2) {
                        manager.update({
                          orientation: (box.orientation + 2) % 3,
                          r: i,
                          c: j,
                        });
                      }
                    }}
                  >
                    <div style={{width: `100%`, height: `100%`, position: 'absolute', border: '1px solid darkgrey'}} />
                    {
                      box.orientation === LState.None ? '' :
                      <svg width={boxSize} height={boxSize} style={{position: 'absolute', top: '0', left: '0'}}>
                        <line x1="0" y1={box.orientation === LState.Left ? 0 : boxSize} x2={boxSize} y2={box.orientation === LState.Left ? boxSize : 0} stroke={box.isLoop ? 'red' : 'black'} strokeWidth="3" />
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
