import { lstat } from "fs";

export class Board {
    static readonly DEFAULT_SPECIFIC = "12x10:d1b1b1c11a113c14c1c11f321c21a2c1a2a3a2a211b12b11a3a2a1c3a132a123b1a3e33b1221a2a22a21a1222a1a1a2b0a11a1c1a1b";
    static readonly DEFAULT_HEIGHT = 10;
    static readonly DEFAULT_WIDTH = 10;
//game board variables
    private spec!: string;
    private _width!: number;
    private _height!: number;
    private clues!: number[][];
    private lines!: LState[][];
    private solu!: number[][];
//search/result variables
    private adj!:boolean[][];
    private isloop!:boolean[][];
    private visited!:boolean[];
    private tin!: number[];
    private low!: number[];
    private timer!: number;
    private flatlen!: number;


    constructor(spec: string = Board.DEFAULT_SPECIFIC) {
        this.setSpec(spec);
    }

    private setSpec(spec: string): boolean {
        this.spec = spec.trim();

        const [dimensions, data] = this.spec.split(':');
        const [width, height] = dimensions.split('x').map(Number);


        const x = this.spec.indexOf('x');
        const colon = this.spec.indexOf(':', x);
        if(x <= 0 || colon <= x) return false;
        
        this.initboard(parseInt(this.spec.substring(0,x)), parseInt(this.spec.substring(x+1,colon)));
        let row = 0;
        let col = 0;
        for (let cur = colon + 1; cur < this.spec.length; cur++) {
            const c = this.spec.charAt(cur);
            if (c >= '0' && c <= '4') {
                this.clues[row][col++] = parseInt(c);
            } else if (c >= 'a' && c <= 'z') {
                col += c.charCodeAt(0) - 96;
            } else {
                return false;
            }

            if (col >= this._width + 1) {
                row++;
                col = col % (this._width + 1);
            }
        }
        if (!(row == this._height && col == this._width)) {
            return false;
        }
        return true;
    }

    private initboard(width: number, height: number) : boolean{
        if (width > 0 && height > 0) {
            this._width = width;
            this._height = height;
            this.lines = Array.from({length: height}, () => new Array(width));
            this.solu = Array.from({length: height}, () => new Array(width));
            this.clues = Array.from({length: height + 1}, () => new Array(width + 1).fill(-1));
            
            this.isloop = Array.from({length: height}, () => new Array(width));

            this.flatlen = (width + 1) * (height + 1);
            this.adj = Array.from({length: this.flatlen}, () => new Array(4));
            this.visited = new Array(this.flatlen);
            this.tin = new Array(this.flatlen);
            this.low = new Array(this.flatlen);
            return true;
        }
        return false;
    }

    private alter(up: Update): boolean{
        if (up == null) {
            return true;
        }
        if (up.r >= this._height || up.c >= this._width) {
            return false;
        }
        this.lines[up.r][up.c] = up.orientation;
        // update adjacency array
        const flat = (up.r * (this._width + 1)) + up.c;
        if (up.orientation == -1) {
            this.adj[flat][3] = true;
            this.adj[flat + 1][2] = false;
            this.adj[flat + this._width + 1][1] = false;
            this.adj[flat + this._width + 2][0] = true;
        } else if (up.orientation == 1) {
            this.adj[flat][3] = false;
            this.adj[flat + 1][2] = true;
            this.adj[flat + this._width + 1][1] = true;
            this.adj[flat + this._width + 2][0] = false;
        } else {
            this.adj[flat][3] = false;
            this.adj[flat + 1][2] = false;
            this.adj[flat + this._width + 1][1] = false;
            this.adj[flat + this._width + 2][0] = false;
        }
        // TODO: run issue checker
        this.issuecheck(up);

        return true;
    }
    
    private issuecheck(up: Update): boolean {
        this.loopcheck(up);
        return false;
    }

    private loopcheck(up: Update): void {
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
            if (this.adj[v][i]) {
                to = v + (i % 2) * 2 + (i < 2 ? -(this._width + 2) : this._width);
                if (to == p){
                    continue;
                }
                if (this.visited[to]) {
                    this.low[v] = Math.min(this.low[v], this.tin[to]);
                    this.isloop[Math.min(v/(this._width+1), to/(this._width+1))][Math.min(v%(this._width+1), to%(this._width+1))] 
                    = true;
                }else{
                    this.bridge_dfs(to, v);
                    this.low[v] = Math.min(this.low[v], this.low[to]);
                    this.isloop[Math.min(v/(this._width+1), to/(this._width+1))][Math.min(v%(this._width+1), to%(this._width+1))] 
                    = (this.low[to] <= this.tin[v]);
                }
            }
        }

    }

    public stringifylines(): string {
        return this.lines.map(line => line.toString()).join('\n');
    }
    
    public stringifygrid(): string {
        return this.clues.map(row => row.toString()).join('\n');
    }
    
    public get width() {
        return this._width;
    }

    public get height() {
        return this._height;
    }

    private clueIsSatisfied(r : number, c: number): boolean { 
        let count = 0;
        let maxcount = 0;
        if (r > 0 && c > 0) {
            if(this.lines[r - 1][c - 1] == -1){
                count++;
                maxcount++;
            }else if(this.lines[r-1][c-1] == 0){
                maxcount++;
            }
        }
        if (r < this._height && c > 0) {
            if(this.lines[r][c - 1] == 1){
                count++;
                maxcount++;
            }else if(this.lines[r][c-1] == 0){
                maxcount++;
            }
        }
        if (r > 0 && c < this._width) {
            if(this.lines[r - 1][c] == 1){
                count++;
                maxcount++;
            }else if(this.lines[r-1][c] == 0){
                maxcount++;
            }
        }
        if (r < this._height && c < this._width) {
            if(this.lines[r][c] == -1){
                count++;
                maxcount++;
            }else if(this.lines[r][c] == 0){
                maxcount++;
            }
        }
        return count <= this.clues[r][c] && maxcount >= this.clues[r][c];
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
    
    public simplify(): SimplifiedBoardData {
        return {
            clues: this.clues,
            board: this.lines.map((row, x) => {
                return row.map((orientation, y) => ({
                    x, y, orientation,
                    isLoop: this.isloop[x][y],
                }));
            }),
        }
    }
}

export const enum LState {
    Left = -1,
    None = 0,
    Right = 1,
}


export type SimplifiedBoardData = {
    clues: number[][];
    board: {
        x: number;
        y: number;
        orientation: LState;
        isLoop: boolean;
    }[][],
}