import { LState, PartialUpdate, BoardState } from './types';

const DEFAULT_SPECIFIC = "12x10:d1b1b1c11a113c14c1c11f321c21a2c1a2a3a2a211b12b11a3a2a1c3a132a123b1a3e33b1221a2a22a21a1222a1a1a2b0a11a1c1a1b";

export class Board {

    //game board variables
    public state!: BoardState;
    /*
    private spec!: string;
    private _width!: number;
    private _height!: number;
    private clues!: number[][];
    private lines!: LState[][];
    */
    private solu!: number[][];

    //search/result variables
    //private adj!:boolean[][];
    //private isloop!:boolean[][];
    private visited!:boolean[];
    private tin!: number[];
    private low!: number[];
    private timer!: number;
    private flatlen!: number;


    constructor(spec: string = DEFAULT_SPECIFIC) {
        this.setSpec(spec);
    }

    public setBoard(up: BoardState): boolean {
        this.initBoard(up.lines.length, up.lines[0].length);
        this.state.lines = up.lines;
        this.state.clues = up.clues;
        this.issueCheck();
        return false;
    }

    public setSpec(spec: string): boolean {
        spec = spec.trim();
        const x = spec.indexOf('x');
        const colon = spec.indexOf(':', x);
        if(x <= 0 || colon <= x) return false;
        
        this.initBoard(parseInt(spec.substring(0,x)), parseInt(spec.substring(x+1,colon)));
        this.state.spec = spec;
        let row = 0;
        let col = 0;
        for (let cur = colon + 1; cur < this.state.spec.length; cur++) {
            const c = this.state.spec.charAt(cur);
            if (c >= '0' && c <= '4') {
                this.state.clues[row][col++].clue = parseInt(c);
            } else if (c >= 'a' && c <= 'z') {
                col += c.charCodeAt(0) - 96;
            } else {
                return false;
            }

            if (col >= this.state.width + 1) {
                row++;
                col = col % (this.state.width + 1);
            }
        }
        if (!(row == this.state.height && col == this.state.width)) {
            return false;
        }
        return true;
    }

    private initBoard(width: number, height: number) : boolean{
        if (width > 0 && height > 0) {
            this.state = {
                width: width,
                height: height,
                clues: Array.from({length: height + 1}, () => Array.from({length: width + 1}, () =>({
                    clue: -1,
                    satisfiable: true,
                    adj: new Array(4).fill(false)
                }))),
                lines: Array.from({length: height}, () => Array.from({length: width}, () =>({
                    orientation: LState.None,
                    isLoop: false
                })))
            };
            this.solu = Array.from({length: height}, () => new Array(width));
            this.flatlen = (width + 1) * (height + 1);
            this.visited = new Array(this.flatlen);
            this.tin = new Array(this.flatlen);
            this.low = new Array(this.flatlen);
            return true;
        }
        return false;
    }

    public alter(up: PartialUpdate): boolean{
        if (up == null) {
            return true;
        }
        if (up.r >= this.state.height || up.c >= this.state.width) {
            return false;
        }
        this.state.lines[up.r][up.c].orientation = up.orientation;
        // update adjacency array
        this.state.clues[up.r][up.c].adj[3] = up.orientation == LState.Left;
        this.state.clues[up.r][up.c + 1].adj[2] = up.orientation == LState.Right;
        this.state.clues[up.r + 1][up.c].adj[1] = up.orientation == LState.Right;
        this.state.clues[up.r + 1][up.c + 1].adj[0] = up.orientation == LState.Left;
        //const flat = (up.r * (this.state.width + 1)) + up.c;
        // if (up.orientation == LState.Left) {
        //     this.state.clues[up.r][up.c].adj[3] = true;
        //     this.state.clues[up.r][up.c + 1].adj[2] = false;
        //     this.state.clues[up.r + 1][up.c].adj[1] = false;
        //     this.state.clues[up.r + 1][up.c + 1].adj[0] = true;
        // } else if (up.orientation == LState.Right) {
        //     this.state.clues[up.r][up.c].adj[3] = false;
        //     this.state.clues[up.r][up.c + 1].adj[2] = true;
        //     this.state.clues[up.r + 1][up.c].adj[1] = true;
        //     this.state.clues[up.r + 1][up.c + 1].adj[0] = false;
        // } else {
        //     this.state.clues[up.r][up.c].adj[3] = false;
        //     this.state.clues[up.r][up.c + 1].adj[2] = false;
        //     this.state.clues[up.r + 1][up.c].adj[1] = false;
        //     this.state.clues[up.r + 1][up.c + 1].adj[0] = false;
        // }
        // TODO: run issue checker
        this.issueUpdate(up);
        return true;
    }
    
    private issueCheck(): boolean {
        this.loopCheck();
        return false;
    }

    private issueUpdate(up: PartialUpdate): boolean {
        this.state.clues[up.r][up.c].satisfiable = this.clueIsSatisfiable(up.r, up.c);
        this.state.clues[up.r][up.c + 1].satisfiable = this.clueIsSatisfiable(up.r, up.c + 1);
        this.state.clues[up.r + 1][up.c].satisfiable = this.clueIsSatisfiable(up.r + 1, up.c);
        this.state.clues[up.r + 1][up.c + 1].satisfiable = this.clueIsSatisfiable(up.r + 1, up.c + 1);

        this.loopCheck();
        return false;
    }

    private loopCheck() {
        this.visited.fill(false);
        this.tin.fill(-1);
        this.low.fill(-1);
        this.timer = 0;
        for (let i = 0; i < this.flatlen; i++) {
            if (!this.visited[i]) {
                this.bridge_dfs(i, -1);
            }
        }
    }

    private loopUpdate(up: PartialUpdate): void {
        this.visited.fill(false);
        this.tin.fill(-1);
        this.low.fill(-1);
        this.timer = 0;
        for (let i = 0; i < this.flatlen; i++) {
            if (!this.visited[i]) {
                this.bridge_dfs(i, -1);
            }
        }
    }

    private bridge_dfs(v: number, p: number): void {
        this.visited[v] = true;
        this.tin[v] = this.low[v] = this.timer++;
        let to;
        for (let i = 0; i < 4; i++) {
            if (this.state.clues[Math.floor(v/(this.state.width+1))][v%(this.state.width+1)].adj[i]) {
                to = v + (i % 2) * 2 + (i < 2 ? -(this.state.width + 2) : this.state.width);
                if (to == p){
                    continue;
                }
                if (this.visited[to]) {
                    this.low[v] = Math.min(this.low[v], this.tin[to]);
                    this.state.lines[Math.floor(Math.min(v/(this.state.width+1), to/(this.state.width+1)))]
                            [Math.min(v%(this.state.width+1), to%(this.state.width+1))].isLoop 
                    = true;
                }else{
                    this.bridge_dfs(to, v);
                    this.low[v] = Math.min(this.low[v], this.low[to]);
                    this.state.lines[Math.floor(Math.min(v/(this.state.width+1), to/(this.state.width+1)))]
                            [Math.min(v%(this.state.width+1), to%(this.state.width+1))].isLoop
                    = (this.low[to] <= this.tin[v]);
                }
            }
        }

    }

    public stringifylines(): string {
        return this.state.lines.map(line => line.toString()).join('\n');
    }
    
    public stringifygrid(): string {
        return this.state.clues.map(row => row.toString()).join('\n');
    }
    
    public get width() {
        return this.state.width;
    }

    public get height() {
        return this.state.height;
    }

    public clueIsSatisfiable(r : number, c: number): boolean {
        if(this.state.clues[r][c].clue == -1) return true;
        let count = 0;
        let maxcount = 0;
        if (r > 0 && c > 0) {
            if(this.state.lines[r - 1][c - 1].orientation == LState.Left){
                count++;
                maxcount++;
            }else if(this.state.lines[r-1][c-1].orientation == LState.None){
                maxcount++;
            }
        }
        if (r < this.state.height && c > 0) {
            if(this.state.lines[r][c - 1].orientation == LState.Right){
                count++;
                maxcount++;
            }else if(this.state.lines[r][c-1].orientation == LState.None){
                maxcount++;
            }
        }
        if (r > 0 && c < this.state.width) {
            if(this.state.lines[r - 1][c].orientation == LState.Right){
                count++;
                maxcount++;
            }else if(this.state.lines[r-1][c].orientation == LState.None){
                maxcount++;
            }
        }
        if (r < this.state.height && c < this.state.width) {
            if(this.state.lines[r][c].orientation == LState.Left){
                count++;
                maxcount++;
            }else if(this.state.lines[r][c].orientation == LState.None){
                maxcount++;
            }
        }
        return count <= this.state.clues[r][c].clue && maxcount >= this.state.clues[r][c].clue;
    }

    //TODO: Setup DSF data structure
    private generate_solu(width: number, height: number, 
        solu: LState[][] = Array.from({length: height}, () => new Array(width).fill(LState.None))): 
        LState[][] {

        let sets = Array.from({length: height + 1}, (_,r) => 
            Array.from({length: height + 1}, (_,c) =>
                r*(width + 1) + c));
        let us: boolean;
        let ds: boolean;

        for(let r = 0; r < height; r++) {
            for(let c = 0; c < width; c++) {
                ds = sets[r][c] == sets[r+1][c+1];
                us = sets[r+1][c] == sets[r][c+1];
                //assert !(ds && us);
            }
        }
        return solu;
    }
    
    /*public simplify(): SimplifiedBoardData {
        return {
            clues: this.state.clues.map((row, r) => {
                return row.map((clue, c) => ({
                    clue,
                    satisfiable: this.clueIsSatisfiable(r, c),
                }));
            }),
            lines: this.state.lines.map((row, r) => {
                return row.map((orientation, c) => ({
                    orientation,
                    isLoop: this.isloop[r][c],
                }));
            }),
        }
    }*/
}
