import React, { useEffect, useState } from 'react';
import { BoardState, BoardClueState } from 'slant';
import { BoardInterface } from '../BoardInterface';

const BoardClue = (
  { manager, boxSize, row, col, top, left }: 
  { manager: BoardInterface,
    boxSize: number,
    row: number,
    col: number,
    top: string,
    left: string,
}) => {
  
  const hintSize = boxSize / 2;

  const [clue, setClue] = useState<BoardClueState>({...manager.board.state.clues[row][col]});

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

  useEffect(() => {
    const listener = (board: BoardState) => {
      const newClue = board.clues[row][col];
      if(newClue.satisfiable !== clue.satisfiable || newClue.clue !== clue.clue) setClue({...newClue});
    }
    manager.on('update', listener)
    return () => void manager.removeListener('update', listener);
  }, [manager, row, col, clue]);

  if(clue.clue === -1) return <></>;

  return (
    <div
      style={{
      ...hintStyle,
      top,
      left,
      color: clue.satisfiable ? 'black' : 'red',
      }}
    >{clue.clue}</div>
  )
}

export default BoardClue;

