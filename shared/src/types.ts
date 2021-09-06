
export enum LState {
  None = 0,
  Left = 1,
  Right = 2,
}

export type PartialUpdate = {
  orientation: LState;
  r: number;
  c: number;
}

export type BoardState = {
  spec?: string,
  width: number,
  height: number,
  clues: {
    clue: number,
    satisfiable: boolean,
    adj: boolean[]
  }[][];
  lines: {
    orientation: LState;
    isLoop: boolean;
  }[][],
}