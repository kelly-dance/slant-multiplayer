
export enum BoxState {
  EMPTY = 0,
  FORWARD = 1,
  BACKWARD = 2,
}

export type GameState = {
  boxes: BoxState[][];
  clues: (number | undefined)[][];
}
