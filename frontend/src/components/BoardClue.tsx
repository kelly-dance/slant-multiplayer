import React, { useEffect, useState } from 'react';
import { BoardState, BoardClueState } from 'slant';
import { BoardInterface } from '../BoardInterface';

const BoardClue = (
  { manager, boxSize, row, col }: 
  { manager: BoardInterface,
    boxSize: number,
    row: number,
    col: number,
}) => {
  
  const hintSize = boxSize / 2;

  const [clue, setClue] = useState<BoardClueState>({...manager.board.state.clues[row][col]});

  const baseScale = 20;
  const hintStyle: React.CSSProperties = {
    position: 'absolute',
    width: `${baseScale}px`,
    height: `${baseScale}px`,
    border: `${baseScale/20}px solid black`,
    borderRadius: '50%',
    textAlign: 'center',
    lineHeight: `${baseScale}px`,
    backgroundColor: 'white',
    fontSize: `${baseScale/1.1}px`,
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
    zIndex: 100,
    userSelect: 'none',
    pointerEvents: 'none',
    transform: `translate(${boxSize * col - baseScale / 2}px, ${boxSize * row - baseScale / 2}px) scale(${hintSize / baseScale})`,
  }

  useEffect(() => {
    const listener = (board: BoardState) => {
      const newClue = board.clues[row]?.[col];
      if(!newClue) return;
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
      color: clue.satisfiable ? 'black' : 'red',
      }}
    >{clue.clue}</div>
  )
}

export default BoardClue;

