import { Coord, Grid, GridPos, Direction } from "./modules/grid";
import { bigCombination, combination } from 'js-combinatorics';
import {Rig} from "./modules/rig";

const rig = new Rig(11,
    async (d) => {
        const grid = new Grid<string>();
        grid.parseFromString(d, {"#": "#"});
        const [topleft, bottomright] = grid.boundaries();
        const emptyCols = [];
        const emptyRows = [];
        const allOld = [...grid.positions("#")];
        for (let x = 0; x < bottomright.x; x++) {
            if(!allOld.some(p => p.pos.x === x)){
                emptyCols.push(x);
            }
            if(!allOld.some(p => p.pos.y === x)){
                emptyRows.push(x);
            }
        }
        const grid2 = new Grid<string>();
        for (const point of allOld) {
            const newPos = new Coord(
                point.pos.x + emptyCols.filter(x => x<point.pos.x).length * (1000000 - 1), 
                point.pos.y + emptyRows.filter(x => x<point.pos.y).length * (1000000 - 1))
            grid2.add(newPos, "#");
        }
        const allCombis = bigCombination([...grid2.positions("#")], 2);
        let total = 0;
        allCombis.forEach(pair => {
            total += pair[0].pos.distanceMnhtn(pair[1].pos);
        });
        return total;
    }
);


(async () => {
    await rig.test(`...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`, 82000210);
    await rig.runPrint();
})().then(() => {console.log("Done"); });


function dist(v: GridPos<string>[]) {
    const [first, second] = v;
    return first.pos.distanceMnhtn(second.pos);
}

