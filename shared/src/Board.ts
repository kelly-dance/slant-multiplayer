import { LState, PartialUpdate, BoardState } from './types';

const DEFAULT_SPECIFIC = "36x24:a1b1b1r1l12a31b1a2122a13a2a223a2b13a3a3a3a1b231232c2a132a11b3b2a11a3a3b3a12b31a1a3a2a2c12b2d2a3f2b213c12a3112a1123a3b212a3c2b2a1c12a3a11a3d311a23a13d1a12b2b3a2c32a1122b1b1c1a21a313a2a231a1311b2b23a1a11b11e1f2a2b222b2a2c3a22c2b11b3222b2a3c2b32g3b2a223b2a2223a2a3a3b11c3a122a31a2b2b2a32a2a2b21a2a3i331a213b22c2b3a3a3d11b21a2b32b2b13122b2a3b322b22a2c1a2b3a321b32b32a32a3a2d3232a1a113a3e1a32d32h2a222a3a1c3a2b22e13c22222a1b2a22a11b2232b1a3b3b12322a221b22c2b3d21a311c3a2a21a3a2221b1212a3c3b2b221b323b3c2a22c2a21a22c1a121f2c3a1a222e2d313a2a1a13a12232b122a322c1a23221a221a1a11e1c3a3a1c2d23a2a321h1133a22a22b13c2a21b3212a2a2a212b1b23b12a2a2a1a132a12a2322a32a3a3a1b11b1i1a111a1d1d1b1a";

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

    //determine how specifically to handle Boardstate objects (copy or just reference) leaning towards reference
    public setBoard(up: BoardState): boolean {
        this.initBoard(up.lines.length, up.lines[0].length);
        this.state = up;
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
                }))),
                issues: width * height
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

    public alter(up: PartialUpdate): boolean {
        if (up == null) {
            return true;
        }
        if (up.r >= this.state.height || up.c >= this.state.width) {
            return false;
        }
        if(this.state.lines[up.r][up.c].orientation == up.orientation) return true;
        
        if(up.orientation == LState.None) {
            this.state.issues += this.state.lines[up.r][up.c].isLoop ? 0 : 1;
            this.state.lines[up.r][up.c].isLoop = false;
        }
        this.state.issues += this.state.lines[up.r][up.c].orientation == LState.None ? -1 : 0;

        this.state.lines[up.r][up.c].orientation = up.orientation;
        // update adjacency array
        this.state.clues[up.r][up.c].adj[3] = up.orientation == LState.Left;
        this.state.clues[up.r][up.c + 1].adj[2] = up.orientation == LState.Right;
        this.state.clues[up.r + 1][up.c].adj[1] = up.orientation == LState.Right;
        this.state.clues[up.r + 1][up.c + 1].adj[0] = up.orientation == LState.Left;
        this.issueUpdate(up);
        return true;
    }
    
    private issueCheck(): boolean {
        for(let r = 0; r < this.state.height + 1; r++) {
            for(let c = 0; c < this.state.width + 1; c++) {
                this.clueIsSatisfiable(r, c);
            }
        }
        this.loopCheck();
        return false;
    }

    private issueUpdate(up: PartialUpdate): boolean {
        
        this.clueIsSatisfiable(up.r, up.c);
        this.clueIsSatisfiable(up.r, up.c + 1);
        this.clueIsSatisfiable(up.r + 1, up.c);
        this.clueIsSatisfiable(up.r + 1, up.c + 1);
        this.loopUpdate(up);
        console.log(this.state.issues);
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
        const flat = (up.r * (this.state.width + 1)) + up.c;
        this.bridge_dfs(flat, -1);
        this.bridge_dfs(flat + 1, -1);
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
                const r = Math.floor(Math.min(v/(this.state.width+1), to/(this.state.width+1)));
                const c = Math.min(v%(this.state.width+1), to%(this.state.width+1));

                //if was correct line add one to issues
                this.state.issues += this.state.lines[r][c].isLoop ? 0 : 1;
                if (this.visited[to]) {
                    this.low[v] = Math.min(this.low[v], this.tin[to]);
                    this.state.lines[r][c].isLoop = true;
                    //following is always 0 anyways
                    //this.state.issues += this.state.lines[r][c].isLoop ? 0: -1;
                }else{
                    this.bridge_dfs(to, v);
                    this.low[v] = Math.min(this.low[v], this.low[to]);
                    //if was correct add one to issues
                    this.state.lines[r][c].isLoop = (this.low[to] <= this.tin[v]);
                    this.state.issues += this.state.lines[r][c].isLoop ? 0 : -1;
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

    private clueIsSatisfiable(r : number, c: number): boolean {
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
        this.state.issues += this.state.clues[r][c].satisfiable ? 0: -1;
        const ret = count <= this.state.clues[r][c].clue && maxcount >= this.state.clues[r][c].clue;
        this.state.clues[r][c].satisfiable = ret;
        this.state.issues += ret ? 0: 1;
        return ret;
    }

    //TODO: Setup DSF data structure
    private generate_solu(width: number, height: number, 
        solu: LState[][] = Array.from({length: height}, () => new Array(width).fill(LState.None))): 
        LState[][] {
        let count = 0;
        let sets = Array.from({length: height + 1}, (_,r) => 
            Array.from({length: width + 1}, (_,c) =>
                count++));
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
