import { firstBy } from "thenby";
import { Coord, Grid, GridPos, Direction } from "./modules/grid";
import {Rig} from "./modules/rig";

const rig = new Rig(16,
    async (d) => {
        const grid = new Grid<string>();
        grid.parseFromStringFunc(d, (s)=>s);
        const starts = [...getStartingpoints(grid)];
        const scores = starts.map(b => getEnergizedScore(grid, b));
        return scores.sort(firstBy(s => s, -1))[0];
    }
);
function* getStartingpoints(grid: Grid<string>) {
    const [topleft, bottomright] = grid.boundaries();
    for (let index = topleft.x; index <= bottomright.x; index++) {
        yield new Beam(Direction.South, new Coord(index, -1));
        yield new Beam(Direction.North, new Coord(index, bottomright.y + 1));
    }
    for (let index = topleft.y; index <= bottomright.y; index++) {
        yield new Beam(Direction.East, new Coord(-1, index));
        yield new Beam(Direction.West, new Coord(bottomright.x + 1, index));
    }
}

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
..//.|....`, 51);
    await rig.runPrint();
})().then(() => {console.log("Done"); });



function getEnergizedScore(grid: Grid<string>, startingPoint: Beam) {
    const [topleft, bottomright] = grid.boundaries();
    const energize = new Grid<number>();
    let beams = [startingPoint];
    const seen: { [id: string]: boolean; } = {};
    while (true) {
        beams = beams.map(b => b.step(grid)).flat(2);
        beams = beams
            .filter(b => b.pos.inside(topleft, bottomright));
        const toPrune: number[] = [];
        beams.forEach((b, i) => {
            const v = energize.forCoord(b.pos);
            const vNew = (v || 0) | (1 << b.dir);
            energize.set(b.pos, vNew);
            if (vNew === v) toPrune.push(i);
        });
        toPrune.reverse().forEach(i => beams.splice(i, 1));
        const h = energize.hash();
        if (h in seen) {
            break;
        }
        seen[h] = true;
        console.log(h);
        //console.log(energize.toString((c,v) => (v||0) > 0 ? '#' : '.'));
    }

    return [...energize.positionsFunc((n) => n > 0)].length;
}


