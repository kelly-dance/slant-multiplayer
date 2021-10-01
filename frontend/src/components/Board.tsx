import React, { useEffect, useState } from 'react';
import { BoardState } from 'slant';
import { BoardInterface } from '../BoardInterface';
import BoardCell from './BoardCell';
import BoardClue from './BoardClue';

const pad = 50;

const makeSize = (manager: BoardInterface) => {
  return Math.round(Math.min((window.innerWidth - pad * 2) / manager.width, (window.innerHeight - pad * 2) / manager.height));
}

const Board = ({ manager }: { manager: BoardInterface }) => {
  const [boxSize, setBoxSize] = useState(makeSize(manager));
  const hintSize = boxSize / 2;

  const [board, setBoard] = useState<BoardState>(manager.getBoard());

  useEffect(() => {
    const listener = (newBoard: BoardState) => {
      if(Object.entries(newBoard).some(([key, value]) => value !== board[key as keyof BoardState])) {
        setBoard({...newBoard});
        console.log(newBoard)
      }
    }
    manager.on('update', listener)
    return () => void manager.removeListener('update', listener);
  }, [manager, board]);

  useEffect (() => {
    const handle = () => setBoxSize(makeSize(manager));
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, [manager, board]);

  return (
    <div style={{padding: `${pad}px`}}>
      <div style={{border: '1px solid darkgrey', position:'relative'}}>
        {board.lines.map((row, i) => {
          return (
            <div key={i} style={{whiteSpace:'nowrap'}}>
              {row.map((_, j) => {
                return (
                  <div key={j} style={{display:'inline-block', verticalAlign:'top'}}>
                    <BoardCell boxSize={boxSize} manager={manager} row={i} col={j} />
                  </div>
                );
              })}
            </div>
          );
        })}
        {board.clues.flatMap((row, i) => {
          return row.map(({ clue, satisfiable }, j) => {
            if(clue === -1) return '';
            return (
              <BoardClue
                key={`${i}-${j}`}
                boxSize={boxSize}
                row={i}
                col={j}
                manager={manager}
                top={`${-hintSize/2 + boxSize * i}px`}
                left={`${-hintSize/2 + boxSize * j}px`}
              />
            )
          });
        })}
      </div>
    </div>
  );
}

export default Board;
