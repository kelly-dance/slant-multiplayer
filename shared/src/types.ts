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

export type BoardClueState = {
  clue: number,
  satisfiable: boolean,
  adj: boolean[]
}

export type BoardLineState = {
  orientation: LState,
  isLoop: boolean
}

export type BoardState = {
  spec?: string,
  width: number,
  height: number,
  clues: BoardClueState[][],
  lines: BoardLineState[][],
  issues: number
}

export type SingleplayerLogEntry = {
  update: PartialUpdate,
  prior: LState,
}


//Multiplayer Types
type ServerPartialUpdate = {
  partial: PartialUpdate,
  time: number,
}

export type ServerBoardState = {
  clues: number[][],
  lines: LState[][],
}

export type MultipayeLogEntry = {
  update: ServerPartialUpdate,
  prior: LState,
}

