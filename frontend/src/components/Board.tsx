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

  const [board, setBoard] = useState<BoardState>(manager.getBoard());

  useEffect(() => {
    const listener = (newBoard: BoardState) => {
      if(newBoard.width !== board.width || newBoard.height !== board.height) {
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

  useEffect(() => {
    document.onkeydown = e => {
      if (e.key.toLowerCase() === 'z' && e.ctrlKey) {
        if(e.shiftKey) manager.redo();
        else manager.undo();
      }
      
    }
  }, [manager]);

  return (
    <div style={{ padding: `${pad}px` }} >
      <div style={{ border: '1px solid darkgrey' }} >
        {board.clues.flatMap((row, i) => {
          return row.map((_, j) => {
            return (
              <BoardClue
                key={`${i}-${j}`}
                boxSize={boxSize}
                row={i}
                col={j}
                manager={manager}
              />
            )
          });
        })}
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
      </div>
    </div>
  );
}

export default Board;
