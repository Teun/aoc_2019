import { start } from "repl";
import { Coord, Grid, GridPos, Direction } from "./modules/grid";
import {Rig} from "./modules/rig";
import { C } from "js-combinatorics";

const rig = new Rig(14,
    async (d) => {
        const grid = new Grid<'O'|'#'>();
        grid.parseFromString(d, {'O':'O', '#':'#'});
        const balls = [...grid.positions('O')];

        const [topleft, bottomright] = grid.boundaries();
        const endPositions = balls.map(b => {
            let pos = 0;
            for (let y = 0; y <= bottomright.y; y++) {
                const c = new Coord(b.pos.x, y);
                const before = grid.forCoord(c);
                if(before == '#'){
                    pos = y + 1;
                }else if(before == 'O'){
                    if(c.equals(b.pos)){
                        return pos;
                    }
                    pos++;
                }
            }
        });
        return endPositions.reduce((a,v)=> {
            return a + (bottomright.y + 1 - v);
        },0);

    }
);



(async () => {
    await rig.test(`O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`, 136);
    await rig.runPrint();
})().then(() => {console.log("Done"); });


