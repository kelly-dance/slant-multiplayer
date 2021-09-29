import { Board, BoardState, PartialUpdate } from 'slant';
import * as Socketio from 'socket.io-client';

export abstract class BoardInterface {
  board: Board;

  constructor() {
    this.board = new Board();
  }

  listener?: (data: BoardState) => void;

  onUpdate(listener: (board: BoardState) => void): this {
    this.listener = listener;
    return this;
  }

  emitUpdate(board: BoardState): boolean {
    if (this.listener) {
      this.listener(board);
      return true;
    }
    return false;
  }

  getBoard(): BoardState {
    return this.board.state;
  }

  get width(): number {
    return this.board.width;
  }

  get height(): number {
    return this.board.height;
  }

  abstract update(up: PartialUpdate): void;

  abstract setSpec(spec: string): void;
}

export class SinglePlayerBoardInterface extends BoardInterface {
  update(up: PartialUpdate): void {
    this.board.alter(up);
    this.emitUpdate(this.board.state);
  }

  setSpec(spec: string): void {
    this.board.setSpec(spec);
    this.emitUpdate(this.board.state);
  }
}

export class MultiplayerBoardInterface extends BoardInterface {
  constructor(private con: Socketio.Socket) {
    super();
  }

  update(up: PartialUpdate): void {
    this.board.alter(up);
    this.emitUpdate(this.board.state);
  }

  setSpec(spec: string): void {
    this.board.setSpec(spec);
    this.emitUpdate(this.board.state);
  }
}
