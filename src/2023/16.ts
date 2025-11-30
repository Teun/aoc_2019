import { start } from "repl";
import { Coord, Grid, GridPos, Direction } from "./modules/grid";
import {Rig} from "./modules/rig";
import { C } from "js-combinatorics";
import { Dir } from "fs";

const rig = new Rig(16,
    async (d) => {
        const grid = new Grid<string>();
        grid.parseFromStringFunc(d, (s)=>s);
        const [topleft, bottomright] = grid.boundaries();
        const energize = new Grid<number>();
        const startingPoint = new Beam (Direction.East, new Coord(-1,0));
        let beams = [startingPoint];
        const seen: {[id:string]: boolean} = {};
        while(true){
            beams = beams.map(b => b.step(grid)).flat(2);
            beams = beams
                .filter(b => b.pos.inside(topleft, bottomright));
            const toPrune: number[] = [];
            beams.forEach((b,i) => {
                const v = energize.forCoord(b.pos);
                const vNew = (v||0) | (1<<b.dir);
                energize.set(b.pos, vNew);
                if(vNew === v)toPrune.push(i);
            });
            toPrune.reverse().forEach(i => beams.splice(i, 1));
            const h = energize.hash();
            if(h in seen){
                break;
            }
            seen[h] = true;
            console.log(h);
            //console.log(energize.toString((c,v) => (v||0) > 0 ? '#' : '.'));
        }

        return [...energize.positionsFunc((n)=> n> 0)].length;
    }
);
const map = {
  '/': [[Direction.East], [Direction.North], [Direction.West], [Direction.South]],
  '\\': [[Direction.West], [Direction.South], [Direction.East], [Direction.North]],
  '-': [[Direction.West, Direction.East], [Direction.East], [Direction.West, Direction.East], [Direction.West]],
  '|': [[Direction.North], [Direction.North, Direction.South], [Direction.South], [Direction.North, Direction.South]],
};
class Beam{
    constructor(public dir: Direction, public pos: Coord){}
    public step(g: Grid<string>): Beam[] {
        const res: Beam[] = [];
        const nextPos = this.pos.neighbourTo(this.dir);
        const token = g.forCoord(nextPos);
        if(token === '.') res.push(new Beam(this.dir, nextPos));
        if(token in map) {
            res.push(map[token][this.dir].map(d => new Beam(d, nextPos)));
        }
        return res;
    }
}
(async () => {
    await rig.test(`.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`, 46);
    await rig.runPrint();
})().then(() => {console.log("Done"); });



