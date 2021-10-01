import React, { useEffect, useState } from 'react';
import { LState, BoardState, BoardLineState } from 'slant';
import { BoardInterface } from '../BoardInterface';

const BoardCell = ({ manager, boxSize, row, col }: { manager: BoardInterface, boxSize: number, row: number, col: number }) => {
  const [box, setBox] = useState<BoardLineState>({...manager.board.state.lines[row][col]});

  useEffect(() => {
    const listener = (board: BoardState) => {
      const newBox = board.lines[row]?.[col];
      if(!newBox) return;
      if(newBox.isLoop !== box.isLoop || newBox.orientation !== box.orientation) {
        setBox({...newBox});
      }
    }
    manager.on('update', listener)
    return () => void manager.removeListener('update', listener);
  }, [manager, row, col, box]);

  return (
    <div
      style={{ position: 'relative', border: '1px solid darkgrey', height: `${boxSize}px`, width: `${boxSize}px`}}
      onContextMenu={e => e.preventDefault()}
      onMouseDown={e => {
        if(e.button === 0) {
          manager.update({
            orientation: (box.orientation + 1) % 3,
            r: row,
            c: col,
          });
          e.stopPropagation();
        }else if(e.button === 2) {
          manager.update({
            orientation: (box.orientation + 2) % 3,
            r: row,
            c: col,
          });
          e.stopPropagation();
        }
      }}
    >
      {
        box.orientation === LState.None ? '' :
        <svg width={boxSize} height={boxSize} style={{position: 'absolute', top: '-1', left: '-1', zIndex: 2 }}>
          <line x1="0" y1={box.orientation === LState.Left ? 0 : boxSize} x2={boxSize} y2={box.orientation === LState.Left ? boxSize : 0} stroke={box.isLoop ? 'red' : 'black'} strokeWidth={`${boxSize/20}`} />
        </svg>
      }
    </div>
  )
}

export default BoardCell;

