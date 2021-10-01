import { Board, BoardState, PartialUpdate, SingleplayerLogEntry } from 'slant';
import * as Socketio from 'socket.io-client';
import EventEmitter from 'events';

export abstract class BoardInterface extends EventEmitter {
  board: Board;
  
  constructor() {
    super();
    this.setMaxListeners(100**2);
    this.board = new Board();
  }

  listener?: (data: BoardState) => void;

  emit(event: 'update', board: BoardState): any;
  emit(event: string, arg: any){
    super.emit(event, arg);
  }

  on(event: 'update', listener: (board: BoardState) => any): this;
  on(event: string, listener: (...args: any[]) => any): this {
    return super.on(event, listener);
  }

  emitUpdate(): void {
    this.emit('update', this.board.state);
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
  abstract undo(): void;
  abstract redo(): void;
}

export class SinglePlayerBoardInterface extends BoardInterface {
  undoStack: SingleplayerLogEntry[];
  undoPos: number;

  constructor(){
    super();
    this.undoStack = [];
    this.undoPos = 0;
  }

  update(up: PartialUpdate): void {
    if(this.undoPos !== 0){
      this.undoStack = this.undoStack.slice(this.undoPos);
      this.undoPos = 0;
    }
    this.undoStack.unshift({
      update: up,
      prior: this.board.state.lines[up.r][up.c].orientation,
    })
    this.board.alter(up);
    this.emitUpdate();
  }

  setSpec(spec: string): void {
    this.board.setSpec(spec);
    this.emitUpdate();
  }

  undo(){
    if(this.undoPos >= this.undoStack.length) return;
    this.board.alter({
      ...this.undoStack[this.undoPos].update,
      orientation: this.undoStack[this.undoPos].prior,
    });
    this.undoPos++;
    this.emitUpdate();
  }

  redo(){
    if(this.undoPos === 0) return;
    this.undoPos--;
    this.board.alter(this.undoStack[this.undoPos].update);
    this.emitUpdate();
  }
}

export class MultiplayerBoardInterface extends BoardInterface {
  constructor(private con: Socketio.Socket) {
    super();
  }

  update(up: PartialUpdate): void {
    this.board.alter(up);
    this.emitUpdate();
  }

  setSpec(spec: string): void {
    this.board.setSpec(spec);
    this.emitUpdate();
  }

  undo(){}
  redo(){}
}
